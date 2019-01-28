"use strict"

const BaseFormatSet = require('./baseFormatSet');

class BaseFormatSetCsv extends BaseFormatSet {
  commit(subquery, formattedRows) {
    let columns = [];
    for (let field of Object.values(subquery.statement.fields)) {
      columns.push(field.label ? encode(field.label) : '');
    }
    let rows = [columns.join(',')];
    for (let fr of formattedRows) {
      rows.push(this.commitRow(subquery, fr));
    }
    return rows.join("\n");
  }
}

function encode(string) {
  return ((string.trim() !== string) || (string.indexOf(',') >= 0) || (string.indexOf('"') >= 0))
    ? '"' + string.replace(/"/gi, '""') + '"'
    : string;
}

BaseFormatSetCsv.id = 'csv';

module.exports = BaseFormatSetCsv;
