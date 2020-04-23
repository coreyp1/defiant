"use strict";

const FieldFormat = require('./fieldFormat');

/**
 * Based on FieldFormat, this format presents the data exactly as it appears
 * in the database.
 *
 * Warning: It is dangerous to use raw, unescaped output, and you should only
 * use this format if you trust the contents and you know what you are doing!
 * @class
 * @extends Defiant.Plugin.QueryApi.FieldFormat
 * @memberOf Defiant.Plugin.QueryApi
 */
class FieldFormatRaw extends FieldFormat {
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
    // WARNING: This is dangerous. Only use it if you know what you are doing!
    return data.values[field.nameAlias];
  }
}

FieldFormatRaw.id = 'raw';

module.exports = FieldFormatRaw;
