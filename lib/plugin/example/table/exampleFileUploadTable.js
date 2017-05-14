"use strict";

const Table = require('../../orm/table');

class ExampleFileUpload extends Table {
  schema() {
    let schema = super.schema();
    schema.columns.push({
      name: 'fileId',
      dataType: 'INTEGER',
      notNull: false,
      unique: false,
    });
    schema.keys.push('fileId');
    return schema;
  }

  getUrl(file) {
    return Promise.resolve(`/file/example/uploaded/${file.uuid}`);
  }
}

module.exports = ExampleFileUpload;
