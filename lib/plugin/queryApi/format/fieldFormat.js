"use strict";

class FieldFormat {
  constructor(engine, data={}) {
    this.engine = engine;
    ['id', 'data'].map(val => this[val] = data[val] ? data[val] : (this[val] ? this[val] : this.constructor[val]));
  }

  commit(field, data) {
    // TODO: Escape.
    return `<div class="value">${data.values[field.nameAlias]}</div>`;
  }
}

FieldFormat.id = 'text';

module.exports = FieldFormat;
