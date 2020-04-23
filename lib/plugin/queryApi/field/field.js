"use strict";

/**
 * A Field is an individual element of a
 * [Query]{@link Defiant.Plugin.QueryApi.Query}.  It may comprise multiple
 * individual fields (such as an address field).
 * @class
 * @memberOf Defiant.Plugin.QueryApi
 */
class Field {
  /**
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @param {Object} data
   *   The setup data.
   * @returns {Defiant.Plugin.QueryApi.Field}
   *   The instantiated Field object.
   */
  constructor(engine, data={}) {
    /**
     * @member {Defiant.Engine} Defiant.Plugin.QueryApi.Field#engine
     *   The app engine.
     */
    this.engine = engine;

    /**
     * @member {Object} Defiant.Plugin.QueryApi.Field#data
     *   The setup data.
     */
    this.data = data;

    [
      /**
       * @member {String} Defiant.Plugin.QueryApi.Field#tableName
       *   The id of the Entity in the
       *   [Orm.entityRegistry]{@link Defiant.Plugin.Orm#entityRegistry} that
       *   this Field is associated with.
       */
      'tableName',
      /**
       * @member {String} Defiant.Plugin.QueryApi.Field#tablfieldNameeName
       *   The name of the column in the database table associated with this
       *   Field.
       */
      'fieldName',
    ].map(key => this[key] = data[key] ? data[key] : this.constructor[key]);
  }

  /**
   * Assemble the fields to be added to the SELECT part of the database query.
   * @function
   * @param {String} tableAlias
   *   The alias of the table name.
   * @param {String} alias
   *   The alias of the field name.
   * @return {Object[]}
   *   An array of field objects to be added to the SELECT of the database
   *   query.
   */
  addField(tableAlias, alias) {
    const Table = this.engine.pluginRegistry.get('Orm').entityRegistry.get(this.tableName);
    let table = this.engine.sql.define(Table.schema()).as(tableAlias);
    return [table[this.fieldName].as(alias)];
  }

  /**
   * Assemble the clause to be added to the WHERE of the database query.
   * @function
   * @param {Defiant.Context} context
   *   The request context.
   * @param {String} tableAlias
   *   The alias of the table name.
   * @param {String} alias
   *   The alias of the field name.
   * @param {Object} data
   *   The information for the clause
   * @returns {Object}
   *   The clause to be added to the WHERE of the database query.
   */
  addWhere(context, tableAlias, alias, data) {
    const Table = this.engine.pluginRegistry.get('Orm').entityRegistry.get(this.tableName);
    let table = this.engine.sql.define(Table.schema()).as(tableAlias);
    // Note: don't use field alias, for the same reason as in the OrderBy.
    switch(data.data.test) {
    case "=":
      switch(data.data.argument) {
      case "from URL":
        let index = parseInt(data.data.option);
        return context.request.urlTokenized.length < index
          ? table[this.fieldName].isNull()
          : table[this.fieldName].equals(context.request.urlTokenized[index - 1])
      case "null":
        return table[this.fieldName].isNull();
      case "explicit":
        return table[this.fieldName].equals(data.data.option);
      }
      break;
    case "!=":
      switch(data.data.argument) {
      case "from URL":
        let index = parseInt(data.data.option);
        return context.request.urlTokenized.length < index
          ? table[this.fieldName].isNull()
          : table[this.fieldName].notEquals(context.request.urlTokenized[index - 1]);
      case "null":
        return table[this.fieldName].isNotNull();
      case "explicit":
        return table[this.fieldName].notEquals(data.data.option);
      }
      break;
    case "<":
      switch(data.data.argument) {
      case "from URL":
        let index = parseInt(data.data.option);
        return context.request.urlTokenized.length < index
          ? table[this.fieldName].isNull()
          : table[this.fieldName].lt(context.request.urlTokenized[index - 1])
      case "explicit":
        return table[this.fieldName].lt(data.data.option);
      }
      break;
    case "<=":
      switch(data.data.argument) {
      case "from URL":
        let index = parseInt(data.data.option);
        return context.request.urlTokenized.length < index
          ? table[this.fieldName].isNull()
          : table[this.fieldName].lte(context.request.urlTokenized[index - 1])
      case "explicit":
        return table[this.fieldName].lte(data.data.option);
      }
      break;
    case ">":
      switch(data.data.argument) {
      case "from URL":
        let index = parseInt(data.data.option);
        return context.request.urlTokenized.length < index
          ? table[this.fieldName].isNull()
          : table[this.fieldName].gt(context.request.urlTokenized[index - 1])
      case "explicit":
        return table[this.fieldName].gt(data.data.option);
      }
      break;
    case ">=":
      switch(data.data.argument) {
      case "from URL":
        let index = parseInt(data.data.option);
        return context.request.urlTokenized.length < index
          ? table[this.fieldName].isNull()
          : table[this.fieldName].gte(context.request.urlTokenized[index - 1])
      case "explicit":
        return table[this.fieldName].gte(data.data.option);
      }
      break;
    case "like":
    case "not like":
    case "in": // .in()
    case "not in": // .notIn()
      // TODO: Clauses
    }
    return table[this.fieldName].isNull();
  }

  /**
   * Assemble the clause to be added to the ORDER BY of the database query.
   * @function
   * @param {String} tableAlias
   *   The alias of the table name.
   * @param {String} alias
   *   The alias of the field name.
   * @param {Object} data
   *   The information for the clause
   * @returns {Object}
   *   The clause to be added to the ORDER BY of the database query.
   */
  addOrderBy(tableAlias, alias, data) {
    const Table = this.engine.pluginRegistry.get('Orm').entityRegistry.get(this.tableName);
    let table = this.engine.sql.define(Table.schema()).as(tableAlias);
    // Note: Do not try to use table[field].aliased(alias).
    // It produces an error, and while the table name alias is needed,
    // the field alias itself is not required for the sort to work.
    switch (data.expression) {
    case "desc":
      return [table[this.fieldName].desc];
    case "asc":
      return [table[this.fieldName].asc];
    case "null":
      return [table[this.fieldName].isNull()];
    case "notNull":
      return [table[this.fieldName].isNotNull()];
    default:
      return [table[this.fieldName]];
    }
  }

  /**
   * Zip up the prototype chain and assemble an array (union) of all of the
   * available formats.
   * @function
   * @returns {String[]}
   *   An array of [Format]{@link Defiant.Plugin.QueryApi.Format} identifiers
   *   which can be used by this Field.
   */
  getFormats() {
    let list = [];
    let prototype = Object.getPrototypeOf(this);
    while (prototype) {
      list.push(...(prototype.constructor.formats || []));
      prototype = Object.getPrototypeOf(prototype);
    }
    return list;
  }

  /**
   * Render the Field into a String.
   * @todo Shouldn't this be async?
   * @function
   * @param {Defiant.Context} context
   *   The request context
   * @param {Object} subquery
   *   The subquery that this field is a part of.
   * @param {Object} field
   *   The field format information.
   * @param {Object} data
   *   The settings object.
   * @returns {String}
   *   The rendered output of the field as a string.
   */
  formatOutput(context, subquery, field, data) {
    const fieldFormatRegistry = this.engine.pluginRegistry.get('QueryApi').fieldFormatRegistry;
    const format = fieldFormatRegistry.get(field.format.type || 'text');
    return format ? format.commit(context, subquery, field, data) : '';
  }
}

Field.tableName = '';
Field.fieldName = '';
Field.formats = ['raw', 'text'];

module.exports = Field;
