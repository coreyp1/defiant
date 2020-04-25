"use strict";

const FormInstance = require('../../formApi/formInstance');

/**
 * Example form to demonstrate the FileApi.
 * @class
 * @extends Defiant.Plugin.FormApi.FormInstance
 * @memberOf Defiant.Plugin.Example
 */
class ExampleFileUploadForm extends FormInstance {
  /**
   * When this function is finished, then the form should be ready to
   * be rendered as a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
  async init(data={}) {
    const FormApi = this.context.engine.pluginRegistry.get('FormApi');
    const File = FormApi.getElement('File');
    const Button = FormApi.getElement('Button');
    const GenericRenderable = FormApi.getElement('GenericRenderable');

    let files = [];

    // Get a list of files to display.
    // TODO: Convert to View.
    let Orm = this.context.engine.pluginRegistry.get('Orm');
    let sql = this.context.engine.sql;
    let ExampleFileUpload = Orm.entityRegistry.get('exampleFileUpload')
    let exampleUploadTable = sql.define(ExampleFileUpload.schema());
    let fileTable = sql.define(Orm.entityRegistry.get('file').schema());
    let query = exampleUploadTable.select(
      exampleUploadTable.id,
      exampleUploadTable.fileId,
      fileTable.uuid,
      fileTable.created,
      fileTable.size,
      fileTable.originalName)
      .from(exampleUploadTable
        .leftJoin(fileTable)
          .on(exampleUploadTable.fileId.equals(fileTable.id)))
      .toQuery();
    let db = this.context.engine.database;
    // Execute the query.
    let rows = await new Promise((accept) => {
      db.all(query.text, ...query.values, (err, rows) => {
        if (rows) {
          return accept(rows);
        }
        return accept(err);
      });
    });
    for (let index in rows) {
      rows[index].url = await ExampleFileUpload.getUrl(rows[index]);
      files.push(rows[index]);
    }

    // Build the form.
    this
      .addInstance(File.newInstance(this.context, {
        name: 'fileUpload',
        multiple: true,
        data: {
          label: 'File',
          description: 'Choose a file to upload.',
        },
      }))
      .addInstance(Button.newInstance(this.context, {
        name: 'submit',
        data: {
          value: 'submit',
          content: 'Submit',
        }
      }))
      .addInstance(GenericRenderable.newInstance(this.context, {
        name: 'fileUploadListRenderable',
        renderable: this.context.theme.getRenderable('FileUploadListRenderable'),
        renderableSetup: {
          data: {
            files: files,
          },
        },
      }));

    await super.init();
  }

  /**
   * Perform the form submission.
   * @function
   * @async
   */
  async submit() {
    let Orm = this.context.engine.pluginRegistry.get('Orm');
    let exampleFileUpload = Orm.entityRegistry.get('exampleFileUpload');
    let fileUploadEntity = Orm.entityRegistry.get('fileUpload');
    let fileEntity = Orm.entityRegistry.get('file');
    let post = this.context.post[this.name];

    await super.submit();

    // Loop through the uploaded files.
    for (let key in post['fileUpload[files]']) {
      let file = post['fileUpload[files]'][key];

      // Load the uploaded file data.
      let upload = {id: file.id}
      await fileUploadEntity.load(upload);

      // Create a new File entity.
      let entity = {};
      ['uuid', 'accountId', 'size', 'originalName', 'path', 'created'].map(key => entity[key] = upload[key]);
      entity.usageCount = 1;
      entity.type = 'exampleFileUpload';
      await fileEntity.save(entity);

      // Create exampleFileUpload table record.
      let record = {fileId: entity.id};
      await exampleFileUpload.save(record);

      // Delete the old record.
      await fileUploadEntity.purge({id: upload.id});

      // Remove the entry from fileUpload[data].
      delete post['fileUpload[files]'][key];
    }
  }
}

module.exports = ExampleFileUploadForm;
