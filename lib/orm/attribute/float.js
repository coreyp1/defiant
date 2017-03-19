"use strict";

const Attribute = require('./attribute');

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

  keysToCheckForChange() {
    return super.keysToCheckForChange().concat(['value']);
  }
}

module.exports = Float;
