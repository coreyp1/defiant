"use strict";

const FieldFormat = require('../../queryApi/format/fieldFormat');

/**
 * Provide a Field Format for UUID attributes.
 * @class
 * @extends Defiant.Plugin.QueryApi.FieldFormat
 * @memberOf Defiant.Plugin.Orm
 */
class FieldFormatUuidLink extends FieldFormat {
  commit(context, subquery, field, data) {
    // TODO: Escape.
    return `<div class="value"><a class="uuid" href="/account/${data.values[field.nameAlias]}">${data.values[field.nameAlias]}</a></div>`;
  }
}

FieldFormatUuidLink.id = "uuidLink";

module.exports = FieldFormatUuidLink;
