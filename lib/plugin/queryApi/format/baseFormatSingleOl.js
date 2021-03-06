"use strict"

const BaseFormatSingleUl = require('./baseFormatSingleUl');

/**
 * Render a subquery as an ordered list.
 * @class
 * @extends Defiant.Plugin.QueryApi.BaseFormatSingleUl
 * @memberOf Defiant.Plugin.QueryApi
 */
class BaseFormatSingleOl extends BaseFormatSingleUl {
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
    let output = '';
    for (let field of Object.values(subquery.statement.fields)) {
      let label = field.label ? `<div class="query_field_label">${field.label}</div>` : '';
      output += `<li class="query_field query_field_${field.name} field__${field.nameAlias}">${label}<div class="query_field_value">${formattedRow[field.nameAlias]}</div></li>`;
    }
    return `<ol class="query_row">${output}</ol>`;
  }
}

BaseFormatSingleOl.id = 'ol';

module.exports = BaseFormatSingleOl;
