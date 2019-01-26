"use strict"

const BaseFormat = require('./baseFormat');

class BaseFormatTable extends BaseFormat {
  commit(subquery, formattedRows) {
    let output = '<tr class="header">';
    for (let field of Object.values(subquery.statement.fields)) {
      output += '<th class="query_field_header query_field_header_${field.name} field_header__${field.nameAlias}>' + (field.label ? `<div class="query_field_label">${field.label}</div>` : '') + '</th>';
    }
    output += '</tr>'
    for (let fr of formattedRows) {
      let row = '';
      for (let field of Object.values(subquery.statement.fields)) {
        // TODO: Escape.
        row += `<td class="query_field query_field_${field.name} field__${field.nameAlias}"><div class="query_field_value">${fr[field.nameAlias]}</div></td>`;
      }
      output += `<tr class="query_row">${row}</tr>`;
    }
    return `<table>${output}</table>`;
  }
}

BaseFormatTable.id = 'table';

module.exports = BaseFormatTable;
