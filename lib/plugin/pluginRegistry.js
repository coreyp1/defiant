"use strict";

const Registry = require('../util/registry');

class PluginRegistry extends Registry {
  set(obj, engine) {
    // Initialize the plugin.
    return super.set(new obj(engine));
  }
}

module.exports = PluginRegistry;
