"use strict";

const Attribute = require('./Attribute');

class Text extends Attribute {
  schema() {
    let schema = super.schema();
    schema.columns.push({
      name: 'value',
      dataType: 'TEXT',
      notNull: false,
      unique: false,
    });
    return schema;
  }
}

module.exports = Text;
