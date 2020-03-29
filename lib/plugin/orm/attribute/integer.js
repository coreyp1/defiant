"use strict";

const Attribute = require('./attribute');
const Field = require('../../queryApi/field');

/**
 * An Attribute representing a floating point number.
 * @class
 * @extends Defiant.Plugin.Orm.Attribute
 * @memberOf Defiant.Plugin.Orm
 */
class Integer extends Attribute {
  /**
   * Returns the schema of the table.
   * @function
   * @returns {Object}
   *   A description of the table.
   */
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

  /**
   * Return an array of keys that the Attribute should check that, if the value
   * has changed, then a new revision must be created.
   * @function
   * @returns {String[]}
   *   The names of values that need to be checked in order to realize that the
   *   a new revision must be created.
   */
  keysToCheckForChange() {
    return super.keysToCheckForChange().concat(['value']);
  }

  /**
   * Return the list of fields available for use in a query by the
   * [QueryAPI]{@link Defiant.Plugin.QueryApi}.
   * @function
   * @returns {Map<String,Defiant.Plugin.QueryApi.Field>}
   *   Key/value pairs representing the queryable fields.
   */
  getQueryFields() {
    let fields = super.getQueryFields();
    fields[this.attributeName] = new Field(this.engine, {
      tableName: this.id,
      fieldName: 'value',
    });
    return fields;
  }
}

module.exports = Integer;
