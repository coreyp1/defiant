"use strict"

const BaseFormatSetUl = require('./baseFormatSetUl');

/**
 * Format a query set as an ordered list.
 * @class
 * @extends Defiant.Plugin.QueryApi.BaseFormatSetUl
 * @memberOf Defiant.Plugin.QueryApi
 */
class BaseFormatSetOl extends BaseFormatSetUl {
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
    return `<ol class="query_row">${output}</ol>`;
  }
}

BaseFormatSetOl.id = 'ol';

module.exports = BaseFormatSetOl;
