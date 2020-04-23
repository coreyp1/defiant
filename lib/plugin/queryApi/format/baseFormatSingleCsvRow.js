"use strict"

const BaseFormatSingle = require('./baseFormatSingle');

/**
 * Render a query row as CSV values.
 * @class
 * @extends Defiant.Plugin.QueryApi.BaseFormatSingle
 * @memberOf Defiant.Plugin.QueryApi
 */
class BaseFormatSingleCsvRow extends BaseFormatSingle {
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
    let rows = [];
    for (let field of Object.values(subquery.statement.fields)) {
      rows.push(encode(formattedRow[field.nameAlias]));
    }
    return rows.join(',');
  }
}

/**
 * Escape the string as a CSV value.
 * @memberOf Defiant.Plugin.QueryApi.BaseFormatSingleCsvRow
 * @function
 * @param {String} string
 *   The value to be escaped.
 * @returns {String}
 *   The escaped string.
 */
function encode(string) {
  return ((string.trim() !== string) || (string.indexOf(',') >= 0) || (string.indexOf('"') >= 0))
    ? '"' + string.replace(/"/gi, '""') + '"'
    : string;
}

BaseFormatSingleCsvRow.id = 'csvRow';

module.exports = BaseFormatSingleCsvRow;
