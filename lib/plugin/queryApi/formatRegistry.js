"use strict";

const Registry = require('../../util/registry');

class FormatRegistry extends Registry {
  constructor(engine) {
    super();
    this.engine = engine;
  }
  set(obj) {
    // Initialize the Format with the engine.
    return super.set(new obj(this.engine));
  }
}

module.exports = FormatRegistry;
