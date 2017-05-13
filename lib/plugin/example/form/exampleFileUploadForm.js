"use strict";

const Form = require('../../formApi/form');
const {coroutine: co} = require('bluebird');

class ExampleFileUploadForm extends Form {
  init(context) {
    let FormApi = context.engine.plugin.get('FormApi'),
        File = FormApi.getElement('File'),
        Button = FormApi.getElement('Button');
    return co(function*(self, superInit) {
      self.addElement(new File('fileUpload', {
          label: {content: 'File'},
          description: {content: 'Choose a file to upload.'},
          defaultValue: 'foo',
        }))
        .addElement(new Button('submit', {value: 'submit', content: 'Submit'}));
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
      yield fileEntity.save(entity);

      // Create exampleFileUpload table record.
      let record = {fileId: entity.id};
      yield exampleFileUpload.save(record);

      // Delete the old record.
      yield fileUploadEntity.purge(upload.id);
    })(this, super.submit);
  }
}

module.exports = ExampleFileUploadForm;
