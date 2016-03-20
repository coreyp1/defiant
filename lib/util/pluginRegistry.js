"use strict";

const Registry = require('./registry');

class PluginRegistry extends Registry {
  set(obj, engine) {
    return super.set(new obj(engine));
  }
}

module.exports = PluginRegistry;
