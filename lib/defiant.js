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

// Build the Defiant object to be exported.  All publicly-accessible code
// (e.g., classes and functions) should be listed here, so that any outside
// projects should only need to include Defiant itself, and not traverse
// the directory.  E.g., You should require('defiant').util.mkdirp(), not
// require('defiant/util/mkdirp')().
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

  ['Plugin.Account', require('./plugin/account')],
  ['Plugin.Account.AccountLoadHandler', require('./plugin/account/handler/accountLoadHandler')],
  ['Plugin.Account.ChangePasswordForm', require('./plugin/account/form/changePasswordForm')],
  ['Plugin.Account.ChangePasswordHandler', require('./plugin/account/handler/changePasswordHandler')],
  ['Plugin.Account.LoginForm', require('./plugin/account/form/loginForm')],
  ['Plugin.Account.LoginHandler', require('./plugin/account/handler/loginHandler')],
  ['Plugin.Account.LogoutHandler', require('./plugin/account/handler/logoutHandler')],

  ['Plugin.Fapi', require('./plugin/fapi')],
  ['Plugin.Fapi.FapiHandler', require('./plugin/fapi/handler/fapiHandler')],
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

  // Object Relational Model
  ['Plugin.Orm', require('./plugin/orm')],
  ['Plugin.Orm.Attribute', require('./plugin/orm/attribute')],
  ['Plugin.Orm.Attribute.Float', require('./plugin/orm/attribute/float')],
  ['Plugin.Orm.Attribute.Integer', require('./plugin/orm/attribute/integer')],
  ['Plugin.Orm.Attribute.Text', require('./plugin/orm/attribute/text')],
  ['Plugin.Orm.Entity', require('./plugin/orm/entity')],
  ['Plugin.Orm.Table', require('./plugin/orm/table')],

  ['Plugin.Router', require('./plugin/router')],
  ['Plugin.Router.Item', require('./plugin/router/item')],
  ['Plugin.Router.Handler', require('./plugin/router/handler')],
  ['Plugin.Router.VirtualHandler', require('./plugin/router/virtualHandler')],

  ['Plugin.Http', require('./plugin/http')],
  ['Plugin.Http.Response', require('./plugin/http/response')],
  ['Plugin.Http.Response.Json', require('./plugin/http/response/json')],
  ['Plugin.Http.Response.Redirect', require('./plugin/http/response/redirect')],
  ['Plugin.Http.Response.ServeDirectory', require('./plugin/http/response/serveDirectory')],
  ['Plugin.Http.Response.Text', require('./plugin/http/response/text')],
  ['Plugin.Http.Response.Themed', require('./plugin/http/response/themed')],

  ['Plugin.Layout', require('./plugin/layout')],
  ['Plugin.Layout.DefaultLayoutRenderable', require('./plugin/layout/layout/defaultLayoutRenderable')],
  ['Plugin.Layout.LayoutRenderable', require('./plugin/layout/layout/layoutRenderable')],
  ['Plugin.Layout.LayoutHandler', require('./plugin/layout/handler/layoutHandler')],
  ['Plugin.Layout.Widget', require('./plugin/layout/widget')],
  ['Plugin.Layout.Widget.ContentWidget', require('./plugin/layout/widget/contentWidget')],

  ['Plugin.Message', require('./plugin/message')],
  ['Plugin.Message.Container', require('./plugin/message')],
  ['Plugin.Message.MessageHandler', require('./plugin/message/handler/messageHandler')],
  ['Plugin.Message.MessageWidget', require('./plugin/message/widget/messageWidget')],

  ['Plugin.Session', require('./plugin/session')],
  ['Plugin.Session.SessionHandler', require('./plugin/session/handler/sessionHandler')],

  ['Plugin.Settings', require('./plugin/settings')],
  ['Plugin.Settings.Data', require('./plugin/settings/data')],
  ['Plugin.Settings.SettingsClassMapForm', require('./plugin/settings/form/settingsClassMapForm')],
  ['Plugin.Settings.SettingsClassMapHandler', require('./plugin/settings/handler/settingsClassMapHandler')],
  ['Plugin.Settings.SettingsPathsForm', require('./plugin/settings/form/settingsPathsForm')],
  ['Plugin.Settings.SettingsPathsHandler', require('./plugin/settings/handler/settingsPathsHandler')],

  ['Plugin.ThemeBase', require('./plugin/themeBase')],
  ['Plugin.ThemeBase.DirectoryHandler', require('./plugin/themeBase/handler/directoryHandler')],
  ['Plugin.ThemeBase.Page', require('./plugin/themeBase/renderable/page')],
  ['Plugin.ThemeBase.ThemeBaseHandler', require('./plugin/themeBase/handler/themeBaseHandler')],

  ['Plugin.Theme', require('./plugin/theme')],
  ['Plugin.Theme.Renderable', require('./plugin/theme/renderable')],
  ['Plugin.Theme.Collection', require('./plugin/theme/renderable/collection')],

  ['Plugin.Example', require('./plugin/example')],
  ['Plugin.Example.DirectoryHandler', require('./plugin/example/handler/directoryHandler')],
  ['Plugin.Example.FrontPageHandler', require('./plugin/example/handler/frontPageHandler')],
  ['Plugin.Example.TextHandler', require('./plugin/example/handler/textHandler')],
  ['Plugin.Example.JsonHandler', require('./plugin/example/handler/jsonHandler')],
  ['Plugin.Example.ThemedHandler', require('./plugin/example/handler/themedHandler')],
  ['Plugin.Example.FapiHandler', require('./plugin/example/handler/fapiHandler')],
  ['Plugin.Example.ExampleForm', require('./plugin/example/form/exampleForm')],
].map(([name, obj]) => buildRecursive(name, obj, Defiant));

module.exports = Defiant;
