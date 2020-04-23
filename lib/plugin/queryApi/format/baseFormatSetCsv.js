"use strict"

const BaseFormatSet = require('./baseFormatSet');

/**
 * Format a query set as a CSV, including column headers of the query.
 * @class
 * @extends Defiant.Plugin.QueryApi.BaseFormatSet
 * @memberOf Defiant.Plugin.QueryApi
 */
class BaseFormatSetCsv extends BaseFormatSet {
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
  commit(context, subquery, formattedRows) {
    let columns = [];
    for (let field of Object.values(subquery.statement.fields)) {
      columns.push(field.label ? encode(field.label) : '');
    }
    let rows = [columns.join(',')];
    for (let fr of formattedRows) {
      rows.push(this.commitRow(context, subquery, fr));
    }
    return rows.join("\n");
  }
}

/**
 * Escape the string as a CSV value.
 * @memberOf Defiant.Plugin.QueryApi.BaseFormatSetCsv
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

BaseFormatSetCsv.id = 'csv';

module.exports = BaseFormatSetCsv;
