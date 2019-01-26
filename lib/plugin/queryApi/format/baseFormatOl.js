"use strict"

const BaseFormatUl = require('./baseFormatUl');

class BaseFormatOl extends BaseFormatUl {
  commit(subquery, formattedRows) {
    let output = '';
    for (let fr of formattedRows) {
      let row = '';
      for (let field of Object.values(subquery.statement.fields)) {
        // TODO: Escape.
        //let label = field.label ? `<div class="query_field_label">${field.label}</div>` : '';
        row += `<li class="query_field query_field_${field.name} field__${field.nameAlias}"><div class="query_field_value">${fr[field.nameAlias]}</div></li>`;
      }
      output += `<ol class="query_row">${row}</ol>`;
    }
    return output;
  }
}

BaseFormatOl.id = 'ol';

module.exports = BaseFormatOl;
