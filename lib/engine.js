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
    /**
     * @member {Defiant.Plugin.PluginRegistry} Defiant.Engine#pluginRegistry
     *   The Plugin Registry.
     */
    this.pluginRegistry = new Defiant.Plugin.PluginRegistry();
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
   * @async
   * @param {Defiant.Plugin} plugin A Plugin to load.
   * @returns {Defiant.Engine} The app engine.
   */
  async addPlugin(plugin) {
    this.pluginRegistry.set(plugin, this);
    await this.notify(this.pluginRegistry.get(plugin.name), 'enable');
    return this;
  }

  /**
   * Initialize the Engine and all of the default plugins.
   * @function
   * @async
   * @returns {Promise<Defiant.Engine>}
   *   The app engine.
   */
  async init() {
    for (let plugin of [
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
    ]) {
      this.pluginRegistry.set(plugin, this);
      await this.notify(this.pluginRegistry.get(plugin.name), 'enable');
    }
    return this;
  }

  /**
   * Notify all plugins of some action taken by another plugin.  The plugin to
   * which the action pertains will be the last to receive the notification.
   *
   * When a plugin is enabled, it will receive a "pre:" action to allow it to
   * perform any asynchronous preparation before other plugins are notified.
   * Only the plugin that is the target will receive the "pre:" action.  As
   * such, a plugin will receive the first ("pre:" action) and last (action)
   * notifications during the notification dispatch process.
   * @function
   * @async
   * @param {Defiant.Plugin} plugin
   *   The Plugin to which the `action` pertains.
   * @param {String} action
   *   The action being performed.  Example actions include "enable", "disable",
   *   and "update".
   * @param {Mixed} [data=NULL]
   *   Any supplementary information.
   */
   async notify(plugin, action, data=null) {
     if (plugin instanceof Defiant.Plugin) {
       // Send a pre-action notification to the target plugin.
       await plugin.notify(plugin, `pre:${action}`, data);

       // Notify all other plugins of the action.
       for (let otherPlugin of this.pluginRegistry.getOrderedElements()) {
         if (otherPlugin != plugin) {
           await otherPlugin.notify(plugin, action, data);
         }
       }

       // Send the final notification to the target plugin.
       await plugin.notify(plugin, action, data);
     }
   }
}

module.exports = Engine;
