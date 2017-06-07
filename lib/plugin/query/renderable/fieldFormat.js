"use strict";

const Registry = require('../../util/registry');

class FieldFormat {
  constructor(engine, data={}) {
    this.engine = engine;
    this.data = data;
    ['id'].map(key => this[key] = data[key] ? data[key] : this.constructor[key]);
  }
}

FieldFormat.id = '';

module.exports = FieldFormat;
