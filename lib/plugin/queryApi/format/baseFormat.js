"use strict"

class BaseFormat {
  constructor(engine) {
    this.engine = engine;
    ['id'].map(val => this[val] = this.constructor[val]);
  }

  commit(subquery, formattedRows) {
    let output = '';
    for (let fr of formattedRows) {
      let row = '';
      for (let field of Object.values(subquery.statement.fields)) {
        // TODO: Escape.
        let label = field.label ? `<div class="query_field_label">${field.label}</div>` : '';
        row += `<div class="query_field query_field_${field.name} field__${field.nameAlias}">${label}<div class="query_field_value">${fr[field.nameAlias]}</div></div>`;
      }
      output += `<div class="query_row">${row}</div>`;
    }
    return output;
  }
}

BaseFormat.id = 'inline';

module.exports = BaseFormat;
