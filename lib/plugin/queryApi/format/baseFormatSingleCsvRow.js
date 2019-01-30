"use strict"

const BaseFormatSingle = require('./baseFormatSingle');

class BaseFormatSingleCsvRow extends BaseFormatSingle {
  commit(context, subquery, formattedRow) {
    let rows = [];
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

BaseFormatSingleCsvRow.id = 'csvRow';

module.exports = BaseFormatSingleCsvRow;
