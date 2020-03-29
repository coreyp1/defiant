"use strict";

const Field = require('../../queryApi/field');

/**
 * Provide the UUID as field type visible for queries.
 * @class
 * @extends Defiant.Plugin.QueryApi.Field
 * @memberOf Defiant.Plugin.Orm
 */
class UuidField extends Field {}

UuidField.formats = ['uuidLink'];

module.exports = UuidField;
