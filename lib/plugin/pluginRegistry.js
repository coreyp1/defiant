"use strict";

const Registry = require('../util/registry');

/**
 * TODO: Could this be replaced with an InitRegistry?
 * @class
 * @memberOf Defiant.Plugin
 * @extends Defiant.util.Registry
 */
class PluginRegistry extends Registry {
  /**
   * @function
   * @param {Defiant.Plugin} obj
   *   The plugin to add to the registry.
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @returns {Defiant.Plugin.PluginRegistry}
   *   The plugin registry.
   */
  set(obj, engine) {
    // Initialize the plugin.
    return super.set(new obj(engine));
  }
}

module.exports = PluginRegistry;
