"use strict";

const Registry = require('./util/registry');
let Defiant = undefined;

class Engine {
  constructor() {
    Defiant = require('./defiant');

    // Create registries for plugins.
    this.registry = {};

    // Initialize default Plugins
    this.plugin = new Defiant.util.PluginRegistry();
    [
      Defiant.Plugin.Http,
      Defiant.Plugin.Router,
      Defiant.Plugin.ThemeManager,
      Defiant.Plugin.Theme,
      Defiant.Plugin.Fapi,
      Defiant.Plugin.Session,
      Defiant.Plugin.Example,
    ].map(plugin => this.plugin.set(plugin, this));
  }

  defineBootstrapDirectory() {return this;}
}

module.exports = Engine;
