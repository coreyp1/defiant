'use strict';

const Registry = require('./util/registry');
let Defiant = undefined;

class Engine {
  constructor() {
    Defiant = require('./defiant');

    // Create registries for plugins.
    this.registry = {};

    // Initialize default Plugins.
    this.pluginRegistry = new Defiant.Plugin.PluginRegistry();
    [
      Defiant.Plugin.Settings,
      Defiant.Plugin.Orm,
      Defiant.Plugin.Http,
      Defiant.Plugin.Router,
      Defiant.Plugin.Menu,
      Defiant.Plugin.ThemeBase,
      Defiant.Plugin.ThemeBootstrap,
      Defiant.Plugin.Theme,
      Defiant.Plugin.Layout,
      Defiant.Plugin.Message,
      Defiant.Plugin.FormApi,
      Defiant.Plugin.Session,
      Defiant.Plugin.Account,
      Defiant.Plugin.FileApi,
      Defiant.Library,
      Defiant.Library.JQuery,
      Defiant.Library.JQueryUI,
      Defiant.Library.Materialize,
    ].map(plugin => this.pluginRegistry.set(plugin, this));
  }

  defineBootstrapDirectory(directory) {
    this.bootstrapDirectory = directory;
    return this;
  }

  addPlugin(plugin) {
    this.pluginRegistry.set(plugin, this);
    return this;
  }

  async init() {
    for (let plugin of this.pluginRegistry.getOrderedElements()) {
      await plugin.init();
    }
  }
}

module.exports = Engine;
