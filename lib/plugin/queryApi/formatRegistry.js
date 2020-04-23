"use strict";

const Registry = require('../../util/registry');

/**
 * @todo This should probably be replaced by an InitRegistry.
 * @class
 * @extends Defiant.util.Registry
 * @memberOf Defiant.Plugin.QueryApi
 */
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
