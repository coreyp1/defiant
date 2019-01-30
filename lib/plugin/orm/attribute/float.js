"use strict";

const Attribute = require('./attribute');
const Field = require('../../queryApi/field');

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

  getQueryFields() {
    let fields = super.getQueryFields();
    fields[this.attributeName] = new Field(this.engine, {
      tableName: this.name,
      fieldName: 'value',
    });
    return fields;
  }
}

module.exports = Float;
