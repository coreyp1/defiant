"use strict"

const BaseFormat = require('./baseFormat');

class BaseFormatUl extends BaseFormat {
  commit(subquery, formattedRows) {
    let output = '';
    for (let fr of formattedRows) {
      let row = '';
      for (let field of Object.values(subquery.statement.fields)) {
        // TODO: Escape.
        //let label = field.label ? `<div class="query_field_label">${field.label}</div>` : '';
        row += `<li class="query_field query_field_${field.name} field__${field.nameAlias}"><div class="query_field_value">${fr[field.nameAlias]}</div></li>`;
      }
      output += `<ul class="query_row">${row}</ul>`;
    }
    return output;
  }
}

BaseFormatUl.id = 'ul';

module.exports = BaseFormatUl;
