'use strict';

const Registry = require('./util/registry');
const {coroutine: co} = require('bluebird');
let Defiant = undefined;

class Engine {
  constructor() {
    Defiant = require('./defiant');

    // Create registries for plugins.
    this.registry = {};

    // Initialize the ORM.
    this.orm = new Defiant.Orm(this);
    this.ormRegistry = new Defiant.Orm.OrmRegistry();
    [
      Defiant.Orm.Entity,
    ].map(plugin => this.ormRegistry.set(plugin, this));
    (new Defiant.Orm.Entity()).createTable();

    // Initialize default Plugins.
    this.plugin = new Defiant.Plugin.PluginRegistry();
    [
      Defiant.Plugin.Settings,
      Defiant.Plugin.Http,
      Defiant.Plugin.Router,
      Defiant.Plugin.ThemeBase,
      Defiant.Plugin.Theme,
      Defiant.Plugin.Message,
      Defiant.Plugin.Fapi,
      Defiant.Plugin.Session,
      Defiant.Plugin.Example,
    ].map(plugin => this.plugin.set(plugin, this));
  }

  defineBootstrapDirectory(directory) {
    this.bootstrapDirectory = directory;
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
