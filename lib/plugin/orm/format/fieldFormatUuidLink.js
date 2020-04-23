"use strict";

const FieldFormat = require('../../queryApi/format/fieldFormat');

/**
 * Provide a Field Format for UUID attributes.
 * @class
 * @extends Defiant.Plugin.QueryApi.FieldFormat
 * @memberOf Defiant.Plugin.Orm
 */
class FieldFormatUuidLink extends FieldFormat {
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
    // TODO: Escape.
    return `<div class="value"><a class="uuid" href="/account/${data.values[field.nameAlias]}">${data.values[field.nameAlias]}</a></div>`;
  }
}

FieldFormatUuidLink.id = "uuidLink";

module.exports = FieldFormatUuidLink;
