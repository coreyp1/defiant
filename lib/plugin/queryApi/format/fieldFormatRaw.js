"use strict";

const FieldFormat = require('./fieldFormat');

class FieldFormatRaw extends FieldFormat {
  commit(field, data) {
    // WARNING: This is dangerous. Only use it if you know what you are doing!
    return data.values[field.nameAlias];
  }
}

FieldFormatRaw.id = 'raw';

module.exports = FieldFormatRaw;
