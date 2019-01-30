"use strict"

const BaseFormatSingleUl = require('./baseFormatSingleUl');

class BaseFormatSingleOl extends BaseFormatSingleUl {
  commit(context, subquery, formattedRow) {
    let output = '';
    for (let field of Object.values(subquery.statement.fields)) {
      // TODO: Escape.
      let label = field.label ? `<div class="query_field_label">${field.label}</div>` : '';
      output += `<li class="query_field query_field_${field.name} field__${field.nameAlias}">${label}<div class="query_field_value">${formattedRow[field.nameAlias]}</div></li>`;
    }
    return `<ol class="query_row">${output}</ol>`;
  }
}

BaseFormatSingleOl.id = 'ol';

module.exports = BaseFormatSingleOl;
