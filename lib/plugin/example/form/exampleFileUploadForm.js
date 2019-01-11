"use strict";

const Form = require('../../formApi/form');
const GenericRenderable = require('../../formApi/element/genericRenderable');

class ExampleFileUploadForm extends Form {
  async init(context) {
    let FormApi = context.engine.pluginRegistry.get('FormApi'),
        File = FormApi.getElement('File'),
        Button = FormApi.getElement('Button');

    let files = [];

    // Get a list of files to display.
    // TODO: Convert to View.
    let Orm = context.engine.pluginRegistry.get('Orm');
    let sql = context.engine.sql;
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
    let db = context.engine.database;
    // Execute the query.
    let rows = await new Promise((accept, reject) => {
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
    };

    const FileUploadListRenderable = context.theme.getRenderable('FileUploadListRenderable');
    this
      .addElement(new File('fileUpload', {
        label: {content: 'File'},
        description: {content: 'Choose a file to upload.'},
        defaultValue: 'foo',
        attributes: {
          multiple: undefined,
        },
      }))
      .addElement(new Button('submit', {value: 'submit', content: 'Submit'}))
      .addElement(new GenericRenderable('fileUploadListRenderable', new FileUploadListRenderable({files: files})));

    return await super.init(context);
  }

  async submit(context) {
    let Orm = context.engine.pluginRegistry.get('Orm');
    let exampleFileUpload = Orm.entityRegistry.get('exampleFileUpload');
    let fileUploadEntity = Orm.entityRegistry.get('fileUpload');
    let fileEntity = Orm.entityRegistry.get('file');
    let post = context.post[this.name];

    super.submit(context);

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
