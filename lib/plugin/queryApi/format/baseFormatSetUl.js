"use strict"

const BaseFormatSet = require('./baseFormatSet');

/**
 * Format a query set as an unordered list.
 * @class
 * @extends Defiant.Plugin.QueryApi.BaseFormatSet
 * @memberOf Defiant.Plugin.QueryApi
 */
class BaseFormatSetUl extends BaseFormatSet {
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
    let output = '';
    for (let fr of formattedRows) {
      output += '<li class="query_row">' + this.commitRow(context, subquery, fr) + '</li>';
    }
    return `<ul class="query_set">${output}</ul>`;
  }
}

BaseFormatSetUl.id = 'ul';

module.exports = BaseFormatSetUl;
