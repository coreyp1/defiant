"use strict";

const Defiant = {
  Engine: require('./engine'),
  Plugin: require('./plugin'),
  util: {
    range: require('./util/range'),
    PluginRegistry: require('./util/pluginRegistry'),
    Registry: require('./util/registry'),
  },
};

// Add standard Plugins
[
  ['Router', require('./plugin/router')],
  ['Http', require('./plugin/http')],
].map(([name, module]) => Defiant.Plugin[name] = module);

module.exports = Defiant;
