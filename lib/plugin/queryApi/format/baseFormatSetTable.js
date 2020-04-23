"use strict"

const BaseFormatSet = require('./baseFormatSet');

/**
 * Format a query set as a HTML table.
 * @class
 * @extends Defiant.Plugin.QueryApi.BaseFormatSet
 * @memberOf Defiant.Plugin.QueryApi
 */
class BaseFormatSetTable extends BaseFormatSet {
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
    let output = '<thead><tr>';
    for (let field of Object.values(subquery.statement.fields)) {
      output += `<th class="query_field_header query_field_header_${field.name} field_header__${field.nameAlias}>` + (field.label ? `<div class="query_field_label">${field.label}</div>` : '') + '</th>';
    }
    output += '</tr></thead><tbody>';
    for (let fr of formattedRows) {
      output += this.commitRow(context, subquery, fr);
    }
    output += '</tbody>';
    return `<table>${output}</table>`;
  }
}

BaseFormatSetTable.id = 'table';

module.exports = BaseFormatSetTable;
