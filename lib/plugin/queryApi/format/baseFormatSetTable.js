"use strict"

const BaseFormatSet = require('./baseFormatSet');

class BaseFormatTable extends BaseFormatSet {
  commit(subquery, formattedRows) {
    let output = '<tr class="header">';
    for (let field of Object.values(subquery.statement.fields)) {
      output += '<th class="query_field_header query_field_header_${field.name} field_header__${field.nameAlias}>' + (field.label ? `<div class="query_field_label">${field.label}</div>` : '') + '</th>';
    }
    output += '</tr>'
    for (let fr of formattedRows) {
      output += this.commitRow(subquery, fr);
    }
    return `<table>${output}</table>`;
  }
}

BaseFormatTable.id = 'table';

module.exports = BaseFormatTable;
