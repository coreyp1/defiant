"use strict"

const BaseFormatSingle = require('./baseFormatSingle');

/**
 * Render a query row as a HTML table row.
 * @class
 * @extends Defiant.Plugin.QueryApi.BaseFormatSingle
 * @memberOf Defiant.Plugin.QueryApi
 */
class BaseFormatSingleTableRow extends BaseFormatSingle {
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
    let row = '';
    for (let field of Object.values(subquery.statement.fields)) {
      row += `<td class="query_field query_field_${field.name} field__${field.nameAlias}"><div class="query_field_value">${formattedRow[field.nameAlias]}</div></td>`;
    }
    return `<tr class="query_row">${row}</tr>`;
  }
}

BaseFormatSingleTableRow.id = 'tableRow';

module.exports = BaseFormatSingleTableRow;
