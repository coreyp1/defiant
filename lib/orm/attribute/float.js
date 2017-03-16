"use strict";

const Attribute = require('./Attribute');

class Float extends Attribute {
  schema() {
    let schema = super.schema();
    schema.columns.push({
      name: 'value',
      dataType: 'DOUBLE',
      notNull: false,
      unique: false,
    });
    return schema;
  }
}

module.exports = Float;
