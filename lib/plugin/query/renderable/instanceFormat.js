"use strict";

const Registry = require('../../util/registry');

class BaseFormat {
  constructor(engine, data={}) {
    this.engine = engine;
    this.data = data;
    ['id'].map(key => this[key] = data[key] ? data[key] : this.constructor[key]);
  }
}

BaseFormat.id = '';

module.exports = BaseFormat;
