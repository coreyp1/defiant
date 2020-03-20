'use strict';

// We cannot require() Defiant here, because this file is require()'d by the
// main Defiant library.  Populate it later, when it is safe to do so.
let Defiant = undefined;

/**
 * Create an Engine for this instance of the app.  The Engine should be
 * entirely self-contained, and should be able to operate next to other
 * Engines in the same JS execution thread.
 * @class
 * @memberOf Defiant
 */
class Engine {
  /**
   * @constructor
   */
  constructor() {
    Defiant = require('./defiant');

    // Initialize default Plugins.
    /**
     * @member {Defiant.Plugin.PluginRegistry} Defiant.Engine.pluginRegistry
     *   The Plugin Registry.
     */
    this.pluginRegistry = new Defiant.Plugin.PluginRegistry();
    [
      Defiant.Plugin.Settings,
      Defiant.Plugin.QueryApi,
      Defiant.Plugin.Orm,
      Defiant.Plugin.Http,
      Defiant.Plugin.Router,
      Defiant.Plugin.Menu,
      Defiant.Plugin.ThemeBase,
      Defiant.Plugin.ThemeBootstrap,
      Defiant.Plugin.Theme,
      Defiant.Plugin.FormApi,
      Defiant.Plugin.Layout,
      Defiant.Plugin.Message,
      Defiant.Plugin.Session,
      Defiant.Plugin.Account,
      Defiant.Plugin.FileApi,
      Defiant.Library,
      Defiant.Library.JQuery,
      Defiant.Library.JQueryUI,
      Defiant.Library.Materialize,
    ].map(plugin => this.pluginRegistry.set(plugin, this));
  }

  /**
   * Define the bootstrap directory.
   *
   * This directory must be explicitly set so that subsequent settings files can
   * be loaded.
   * @function
   * @param {String} directory The directory where bootstrap settings are
   *   located.
   * @returns {Defiant.Engine} The app engine.
   */
  defineBootstrapDirectory(directory) {
    /**
     * @member {String} Defiant.Engine#bootstrapDirectory The directory where
     *   bootstrap settings are located.
     */
    this.bootstrapDirectory = directory;
    return this;
  }

  /**
   * Add a plugin to the [PluginRegistry]{@link Defiant.Plugin.PluginRegistry}.
   * @function
   * @param {Defiant.Plugin} plugin A Plugin to load.
   * @returns {Defiant.Engine} The app engine.
   */
  addPlugin(plugin) {
    this.pluginRegistry.set(plugin, this);
    return this;
  }

  /**
   * Initialize the Engine and all of the enabled plugins.
   * @function
   * @async
   */
  async init() {
    for (let plugin of this.pluginRegistry.getOrderedElements()) {
      await plugin.init();
    }
  }
}

module.exports = Engine;
