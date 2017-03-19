"use strict";

const Attribute = require('./attribute');

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

  keysToCheckForChange() {
    return super.keysToCheckForChange().concat(['value']);
  }
}

module.exports = Text;
