"use strict"

const BaseFormatSet = require('./baseFormatSet');

class BaseFormatSetTable extends BaseFormatSet {
  commit(subquery, formattedRows) {
    let output = '<thead><tr>';
    for (let field of Object.values(subquery.statement.fields)) {
      output += '<th class="query_field_header query_field_header_${field.name} field_header__${field.nameAlias}>' + (field.label ? `<div class="query_field_label">${field.label}</div>` : '') + '</th>';
    }
    output += '</tr></thead><tbody>';
    for (let fr of formattedRows) {
      output += this.commitRow(subquery, fr);
    }
    output += '</tbody>';
    return `<table>${output}</table>`;
  }
}

BaseFormatSetTable.id = 'table';

module.exports = BaseFormatSetTable;
