"use strict";

const Field = require('../../queryApi/field');

class UuidField extends Field {}

UuidField.formats = ['uuidLink'];

module.exports = UuidField;
