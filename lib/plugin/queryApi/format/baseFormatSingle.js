"use strict"

class BaseFormatSet {
  constructor(engine) {
    this.engine = engine;
    ['id'].map(val => this[val] = this.constructor[val]);
  }

  commit(subquery, formattedRow) {
    let output = '';
    for (let field of Object.values(subquery.statement.fields)) {
      // TODO: Escape.
      let label = field.label ? `<div class="query_field_label">${field.label}</div>` : '';
      output += `<div class="query_field query_field_${field.name} field__${field.nameAlias}">${label}<div class="query_field_value">${formattedRow[field.nameAlias]}</div></div>`;
    }
    return `<div class="query_row">${output}</div>`;
  }
}

BaseFormatSet.id = 'inline';

module.exports = BaseFormatSet;
