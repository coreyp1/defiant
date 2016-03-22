"use strict";

const Defiant = {};

// Build Defiant Object Recursively
function buildRecursive(name, obj, location, depth = 0) {
  let path = name.split('.');
  if (path.length == depth + 1) {
    location[path[depth]] = obj;
  }
  else {
    buildRecursive(name, obj, location[path[depth]], depth + 1);
  }
}

[
  // Utility Functions
  ['util', {}],
  ['util.range', require('./util/range')],
  ['util.Registry', require('./util/registry')],
  ['util.PluginRegistry', require('./util/pluginRegistry')],
  ['util.merge', require('./util/merge')],

  // Engine that coordinates modules
  ['Engine', require('./engine')],

  // Plugins
  ['Plugin', require('./plugin')],

  ['Plugin.Fapi', require('./plugin/fapi')],
  ['Plugin.Fapi.Form', require('./plugin/fapi/form')],

  ['Plugin.Router', require('./plugin/router')],
  ['Plugin.Router.Item', require('./plugin/router/item')],
  ['Plugin.Router.Handler', require('./plugin/router/handler')],

  ['Plugin.Http', require('./plugin/http')],
  ['Plugin.Http.Response', require('./plugin/http/response')],
  ['Plugin.Http.Response.Json', require('./plugin/http/response/json')],
  ['Plugin.Http.Response.Text', require('./plugin/http/response/text')],
  ['Plugin.Http.Response.Themed', require('./plugin/http/response/themed')],

  ['Plugin.Theme', require('./plugin/theme')],
  ['Plugin.Theme.Renderable', require('./plugin/theme/renderable')],
  ['Plugin.Theme.Collection', require('./plugin/theme/renderable/collection')],
  ['Plugin.Theme.Renderable.Page', require('./plugin/theme/renderable/page')],

  ['Plugin.ThemeManager', require('./plugin/themeManager')],

  ['Plugin.Example', require('./plugin/example')],
  ['Plugin.Example.TextHandler', require('./plugin/example/textHandler')],
  ['Plugin.Example.JsonHandler', require('./plugin/example/jsonHandler')],
  ['Plugin.Example.ThemedHandler', require('./plugin/example/themedHandler')],
  ['Plugin.Example.FapiHandler', require('./plugin/example/fapiHandler')],
  ['Plugin.Example.ExampleForm', require('./plugin/example/exampleForm')],
].map(([name, obj]) => buildRecursive(name, obj, Defiant));

module.exports = Defiant;
