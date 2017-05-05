'use strict';

const Registry = require('./util/registry');
const {coroutine: co} = require('bluebird');
let Defiant = undefined;

class Engine {
  constructor() {
    Defiant = require('./defiant');

    // Create registries for plugins.
    this.registry = {};

    // Initialize default Plugins.
    this.plugin = new Defiant.Plugin.PluginRegistry();
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
      Defiant.Plugin.Fapi,
      Defiant.Plugin.Session,
      Defiant.Plugin.Account,
      Defiant.Library,
      Defiant.Library.JQuery,
      Defiant.Library.JQueryUI,
      Defiant.Library.Materialize,
    ].map(plugin => this.plugin.set(plugin, this));
  }

  defineBootstrapDirectory(directory) {
    this.bootstrapDirectory = directory;
    return this;
  }

  addPlugin(plugin) {
    this.plugin.set(plugin, this);
    return this;
  }

  init() {
    return co(function* (self) {
      for (let plugin of self.plugin.getOrderedElements()) {
        yield plugin.init();
      }
    })(this);
  }
}

module.exports = Engine;
