"use strict";

/**
 * FieldFormat is the base class from which all other ORM field display
 * formatters should be derived.
 *
 * Plugins may add additional field formats to the
 * [field format registry]{@link Defiant.Plugin.QueryApi#fieldFormatRegistry}
 * for use by their fields or other fields.
 * @class
 * @memberOf Defiant.Plugin.QueryApi
 */
class FieldFormat {
  /**
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @param {Object} data
   *   The setup data.
   * @returns {Defiant.Plugin.QueryApi.FieldFormat}
   *   The instantiated FieldFormat object.
   */
  constructor(engine, data={}) {
    /**
     * @member {Defiant.Engine} Defiant.Plugin.QueryApi.FieldFormat#engine
     *   The app engine.
     */
    this.engine = engine;
    [
      /**
      * @member {String} Defiant.Plugin.QueryApi.FieldFormat#id
      *   The unique id of the Handler.
      */
      'id',
      /**
      * @member {String} Defiant.Plugin.QueryApi.FieldFormat#data
      *   The setup data.
      */
      'data',
    ].map(val => this[val] = data[val] ? data[val] : (this[val] ? this[val] : this.constructor[val]));
  }

  /**
   * Return the field rendered as a string.
   * @todo Should this be async? (like RenderableInstance)
   * @todo Do we need to escape the string?
   * @function
   * @param {Defiant.Context} context
   *   The request context.
   * @param {Object} subquery
   *   The subquery that is being rendered.
   * @param {Object} field
   *   The query field being rendered.
   * @param {Object} data
   *   The contents of the row.
   * @returns {String}
   *   The rendered string.
   */
  commit(context, subquery, field, data) {
    return `<div class="value">${data.values[field.nameAlias]}</div>`;
  }
}

FieldFormat.id = 'text';

module.exports = FieldFormat;
