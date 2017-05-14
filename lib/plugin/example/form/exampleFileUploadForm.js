"use strict";

const Form = require('../../formApi/form');
const GenericRenderable = require('../../formApi/element/genericRenderable');
const {coroutine: co, promisify} = require('bluebird');

class ExampleFileUploadForm extends Form {
  init(context) {
    let FormApi = context.engine.plugin.get('FormApi'),
        File = FormApi.getElement('File'),
        Button = FormApi.getElement('Button');

    return co(function*(self, superInit) {

      let files = [];

      // Get a list of files to display.
      // TODO: Convert to View.
      let Orm = context.engine.plugin.get('Orm');
      let sql = context.engine.sql;
      let ExampleFileUpload = Orm.entity.get('exampleFileUpload')
      let exampleUploadTable = sql.define(ExampleFileUpload.schema());
      let fileTable = sql.define(Orm.entity.get('file').schema());
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
      let dball = promisify(db.all, {context: db});
      // Execute the query.
      let rows = yield dball(query.text, ...query.values);
      for (let index in rows) {
        rows[index].url = yield ExampleFileUpload.getUrl(rows[index]);
        files.push(rows[index]);
      };

      const FileUploadListRenderable = context.theme.getRenderable('FileUploadListRenderable');
      self
        .addElement(new File('fileUpload', {
          label: {content: 'File'},
          description: {content: 'Choose a file to upload.'},
          defaultValue: 'foo',
        }))
        .addElement(new Button('submit', {value: 'submit', content: 'Submit'}))
        .addElement(new GenericRenderable('fileUploadListRenderable', new FileUploadListRenderable({files: files})));
      return yield superInit.call(self, context);
    })(this, super.init);
  }

  submit(context) {
    return co(function*(self, superSubmit) {
      let Orm = context.engine.plugin.get('Orm');
      let exampleFileUpload = Orm.entity.get('exampleFileUpload');
      let fileUploadEntity = Orm.entity.get('fileUpload');
      let fileEntity = Orm.entity.get('file');
      let post = context.post[self.name];

      superSubmit.call(self, context);

      // Load the uploaded file data.
      let upload = {id: post['fileUpload[data]'].id}
      yield fileUploadEntity.load(upload);

      // Create a new File entity.
      let entity = {};
      ['uuid', 'accountId', 'size', 'originalName', 'path', 'created'].map(key => entity[key] = upload[key]);
      entity.usageCount = 1;
      entity.type = 'exampleFileUpload';
      yield fileEntity.save(entity);

      // Create exampleFileUpload table record.
      let record = {fileId: entity.id};
      yield exampleFileUpload.save(record);

      // Delete the old record.
      yield fileUploadEntity.purge({id: upload.id});
    })(this, super.submit);
  }
}

module.exports = ExampleFileUploadForm;
