"use strict"

/**
 * BaseFormatSet is the base class for formatters that contol how rows should be
 * rendered as a group.
 *
 * Each element is then formatted by a
 * [BaseFormatSingle]{@link Defiant.Plugin.QueryApi.BaseFormatSingle}.
 *
 * Plugins can register custom formatters in the
 * [baseFormatRegistry]{@link Defiant.Plugin.QueryApi#baseFormatRegistry}.
 * @class
 * @memberOf Defiant.Plugin.QueryApi
 */
class BaseFormatSet {
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
  commitRow(context, subquery, formattedRow) {
    let QueryApi = this.engine.pluginRegistry.get('QueryApi');
    const BaseFormatterSingle = QueryApi.baseFormatSingleRegistry.get(subquery.format.single.type || 'inline');
    return BaseFormatterSingle.commit(context, subquery, formattedRow);
  }

  /**
   * Return the set of `formmattedRows` as a string.
   * @todo Should this be async? (like RenderableInstance)
   * @todo Do we need to escape the string?
   * @function
   * @param {Defiant.Context} context
   *   The request context.
   * @param {Object} subquery
   *   The subquery that is being rendered.
   * @param {Object[]} formattedRows
   *   The rows to be rendered.  The content of each field has already been
   *   redered.
   * @returns {String}
   *   The rendered string.
   */
  commit(context, subquery, formattedRows) {
    let output = '';
    for (let fr of formattedRows) {
      output += this.commitRow(context, subquery, fr);
    }
    return `<div class="query_set">${output}</div>`;
  }
}

BaseFormatSet.id = 'inline';

module.exports = BaseFormatSet;
