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
}

module.exports = Integer;
