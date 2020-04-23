"use strict"

/**
 * BaseFormatSingle is the base class for formatters that contol how a single
 * row should be rendered within the context of a (containing)
 * [BaseFormatSet]{@link Defiant.Plugin.QueryApi.BaseFormatSet}.
 *
 * Plugins can register custom formatters in the
 * [baseFormatSingleRegistry]{@link Defiant.Plugin.QueryApi#baseFormatSingleRegistry}.
 * @class
 * @memberOf Defiant.Plugin.QueryApi
 */
class BaseFormatSingle {
  /**
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @returns {Defiant.Plugin.QueryApi.BaseFormatSet}
   *   The instantiated BaseFormatSet object.
   */
  constructor(engine) {
    /**
     * @member {Defiant.Engine} Defiant.Plugin.QueryApi.Query#engine
     *   The app engine.
     */
    this.engine = engine;
    [
      /**
       * @member {String} Defiant.Plugin.QueryApi.BaseFormatSet#id
       *   The unique id of the set format.
       */
      'id',
    ].map(val => this[val] = this.constructor[val]);
  }

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
      output += `<div class="query_field query_field_${field.name} field__${field.nameAlias}">${label}<div class="query_field_value">${formattedRow[field.nameAlias]}</div></div>`;
    }
    return `<div class="query_row">${output}</div>`;
  }
}

BaseFormatSingle.id = 'inline';

module.exports = BaseFormatSingle;
