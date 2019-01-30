"use strict";

const Attribute = require('./attribute');
const Field = require('../../queryApi/field');

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

  getQueryFields() {
    let fields = super.getQueryFields();
    fields[this.attributeName] = new Field(this.engine, {
      tableName: this.id,
      fieldName: 'value',
    });
    return fields;
  }
}

module.exports = Text;
