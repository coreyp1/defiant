"use strict"

const BaseFormatSingle = require('./baseFormatSingle');

class BaseFormatSingleCsv extends BaseFormatSingle {
  commit(subquery, formattedRow) {
    let columns = [];
    for (let field of Object.values(subquery.statement.fields)) {
      columns.push(field.label ? encode(field.label) : '');
    }
    let rows = [columns.join(',')];
    for (let field of Object.values(subquery.statement.fields)) {
      // TODO: Escape.
      rows.push(encode(formattedRow[field.nameAlias]));
    }
    return rows.join(',');
  }
}

function encode(string) {
  return ((string.trim() !== string) || (string.indexOf(',') >= 0) || (string.indexOf('"') >= 0))
    ? '"' + string.replace(/"/gi, '""') + '"'
    : string;
}

BaseFormatSingleCsv.id = 'csv';

module.exports = BaseFormatSingleCsv;
