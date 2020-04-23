"use strict"

const BaseFormatSingle = require('./baseFormatSingle');

/**
 * Render a subquery as a HTML table, including column headers of the subquery.
 * @class
 * @extends Defiant.Plugin.QueryApi.BaseFormatSingle
 * @memberOf Defiant.Plugin.QueryApi
 */
class BaseFormatSingleTable extends BaseFormatSingle {
  /**
   * Return a single row rendered as a string.
   * @todo Should this be async? (like RenderableInstance)
   * @todo Do we need to escape the string?
   * @function
   * @param {Defiant.Context} context
   *   The request context.
   * @param {Object} subquery
   *   The subquery that is being rendered.
   * @param {Object} formattedRow
   *   The query row being rendered.  The content of each field has already been
   *   redered.
   * @returns {String}
   *   The rendered string.
   */
  commit(context, subquery, formattedRow) {
    let output = ''
    for (let field of Object.values(subquery.statement.fields)) {
      output += `<th class="query_field_header query_field_header_${field.name} field_header__${field.nameAlias}>` + (field.label ? `<div class="query_field_label">${field.label}</div>` : '') + '</th>';
    }
    output = `<thead><tr>${output}</tr></thead>`;
    let row = '';
    for (let field of Object.values(subquery.statement.fields)) {
      row += `<td class="query_field query_field_${field.name} field__${field.nameAlias}"><div class="query_field_value">${formattedRow[field.nameAlias]}</div></td>`;
    }
    output += `<tbody><tr class="query_row">${row}</tr></tbody>`;
    return `<table>${output}</table>`;
  }
}

BaseFormatSingleTable.id = 'table';

module.exports = BaseFormatSingleTable;
