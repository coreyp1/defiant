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
  ['util.Cipher', require('./util/cipher')],
  ['util.range', require('./util/range')],
  ['util.Registry', require('./util/registry')],
  ['util.merge', require('./util/merge')],
  ['util.mkdirp', require('./util/mkdirp')],
  ['util.isEmptyObject', require('./util/isEmptyObject')],

  // Engine that coordinates modules
  ['Engine', require('./engine')],

  // Plugins
  ['Plugin', require('./plugin')],
  ['Plugin.PluginRegistry', require('./plugin/pluginRegistry')],

  ['Plugin.Fapi', require('./plugin/fapi')],
  ['Plugin.Fapi.Form', require('./plugin/fapi/form')],
  ['Plugin.Fapi.Element', require('./plugin/fapi/element')],
  ['Plugin.Fapi.Element.FormValidate', require('./plugin/fapi/element/formValidate')],
  ['Plugin.Fapi.Element.Hidden', require('./plugin/fapi/element/hidden')],
  ['Plugin.Fapi.Element.Encrypt', require('./plugin/fapi/element/encrypt')],
  ['Plugin.Fapi.Element.Static', require('./plugin/fapi/element/static')],
  ['Plugin.Fapi.Element.Button', require('./plugin/fapi/element/button')],
  ['Plugin.Fapi.Element.Text', require('./plugin/fapi/element/text')],
  ['Plugin.Fapi.Element.Checkboxes', require('./plugin/fapi/element/text')],
  ['Plugin.Fapi.Element.Radios', require('./plugin/fapi/element/radios')],
  ['Plugin.Fapi.Element.Select', require('./plugin/fapi/element/select')],
  ['Plugin.Fapi.Element.Password', require('./plugin/fapi/element/password')],
  ['Plugin.Fapi.Element.Textarea', require('./plugin/fapi/element/textarea')],
  ['Plugin.Fapi.Element.Fieldset', require('./plugin/fapi/element/fieldset')],

  ['Plugin.Router', require('./plugin/router')],
  ['Plugin.Router.Item', require('./plugin/router/item')],
  ['Plugin.Router.Handler', require('./plugin/router/handler')],

  ['Plugin.Http', require('./plugin/http')],
  ['Plugin.Http.Response', require('./plugin/http/response')],
  ['Plugin.Http.Response.Json', require('./plugin/http/response/json')],
  ['Plugin.Http.Response.Text', require('./plugin/http/response/text')],
  ['Plugin.Http.Response.Themed', require('./plugin/http/response/themed')],

  ['Plugin.Message', require('./plugin/message')],

  ['Plugin.Session', require('./plugin/session')],

  ['Plugin.Settings', require('./plugin/settings')],
  ['Plugin.Settings.Data', require('./plugin/settings/data')],

  ['Plugin.ThemeBase', require('./plugin/themeBase')],
  ['Plugin.ThemeBase.Page', require('./plugin/themeBase/renderable/page')],

  ['Plugin.Theme', require('./plugin/theme')],
  ['Plugin.Theme.Renderable', require('./plugin/theme/renderable')],
  ['Plugin.Theme.Collection', require('./plugin/theme/renderable/collection')],

  ['Plugin.Example', require('./plugin/example')],
  ['Plugin.Example.TextHandler', require('./plugin/example/handler/textHandler')],
  ['Plugin.Example.JsonHandler', require('./plugin/example/handler/jsonHandler')],
  ['Plugin.Example.ThemedHandler', require('./plugin/example/handler/themedHandler')],
  ['Plugin.Example.FapiHandler', require('./plugin/example/handler/fapiHandler')],
  ['Plugin.Example.ExampleForm', require('./plugin/example/form/exampleForm')],
].map(([name, obj]) => buildRecursive(name, obj, Defiant));

module.exports = Defiant;
