"use strict";

class Field {
  constructor(engine, data={}) {
    this.engine = engine;
    this.data = data;
    ['tableName', 'fieldName'].map(key => this[key] = data[key] ? data[key] : this.constructor[key]);
  }

  addField(tableAlias, alias) {
    const Table = this.engine.pluginRegistry.get('Orm').entityRegistry.get(this.tableName);
    let table = this.engine.sql.define(Table.schema()).as(tableAlias);
    return [table[this.fieldName].as(alias)];
  }

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
          : table[this.fieldName].notEquals(context.request.urlTokenized[index - 1])
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
   * entries.
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

  formatOutput(field, data) {
    const fieldFormatRegistry = this.engine.pluginRegistry.get('QueryApi').fieldFormatRegistry;
    const format = fieldFormatRegistry.get(field.format.type || 'text');
    return format ? format.commit(field, data) : '';
  }
}

Field.tableName = '';
Field.fieldName = '';
Field.formats = ['raw', 'text'];

module.exports = Field;
