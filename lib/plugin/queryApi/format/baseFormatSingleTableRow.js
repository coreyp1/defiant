"use strict"

const BaseFormatSingle = require('./baseFormatSingle');

class BaseFormatSingleTableRow extends BaseFormatSingle {
  commit(subquery, formattedRow) {
    let row = '';
    for (let field of Object.values(subquery.statement.fields)) {
      // TODO: Escape.
      row += `<td class="query_field query_field_${field.name} field__${field.nameAlias}"><div class="query_field_value">${formattedRow[field.nameAlias]}</div></td>`;
    }
    return `<tr class="query_row">${row}</tr>`;
  }
}

BaseFormatSingleTableRow.id = 'tableRow';

module.exports = BaseFormatSingleTableRow;
