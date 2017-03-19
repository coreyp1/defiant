"use strict";

const Attribute = require('./attribute');

class Integer extends Attribute {
  schema() {
    let schema = super.schema();
    schema.columns.push({
      name: 'value',
      dataType: 'INTEGER',
      notNull: false,
      unique: false,
    });
    return schema;
  }

  keysToCheckForChange() {
    return super.keysToCheckForChange().concat(['value']);
  }
}

module.exports = Integer;
