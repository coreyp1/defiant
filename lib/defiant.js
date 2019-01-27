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
  ['util.isValidVariableName', require('./util/isValidVariableName')],
  ['util.rename', require('./util/rename')],
  ['util.tryCatch', require('./util/tryCatch')],
  ['util.bijective', require('./util/bijective')],

  // Engine that coordinates modules
  ['Engine', require('./engine')],

  // Library for integrating 3rd party resources
  ['Library', require('./library')],
  ['Library.JQuery', require('./library/jQuery')],
  ['Library.JQueryUI', require('./library/jQueryUI')],
  ['Library.Materialize', require('./library/materialize')],

  // Plugins
  ['Plugin', require('./plugin')],
  ['Plugin.PluginRegistry', require('./plugin/pluginRegistry')],

  ['Plugin.Account', require('./plugin/account')],
  ['Plugin.Account.AccountHandler', require('./plugin/account/handler/accountHandler')],
  ['Plugin.Account.AccountLoadHandler', require('./plugin/account/handler/accountLoadHandler')],
  ['Plugin.Account.ChangePasswordForm', require('./plugin/account/form/changePasswordForm')],
  ['Plugin.Account.LoginForm', require('./plugin/account/form/loginForm')],
  ['Plugin.Account.LogoutHandler', require('./plugin/account/handler/logoutHandler')],
  ['Plugin.Account.AccountQuery', require('./plugin/account/query/accountQuery')],

  ['Plugin.FileApi', require('./plugin/fileApi')],
  ['Plugin.FileApi.FileTable', require('./plugin/fileApi/table/fileTable')],
  ['Plugin.FileApi.LocalManager', require('./plugin/fileApi/manager/localManager')],
  ['Plugin.FileApi.LocalManagerHandler', require('./plugin/fileApi/handler/localManagerHandler')],
  ['Plugin.FileApi.Manager', require('./plugin/fileApi/manager')],

  ['Plugin.FormApi', require('./plugin/formApi')],
  ['Plugin.FormApi.Element', require('./plugin/formApi/element')],
  ['Plugin.FormApi.Element.Button', require('./plugin/formApi/element/button')],
  ['Plugin.FormApi.Element.Checkboxes', require('./plugin/formApi/element/text')],
  ['Plugin.FormApi.Element.Encrypt', require('./plugin/formApi/element/encrypt')],
  ['Plugin.FormApi.Element.Fieldset', require('./plugin/formApi/element/fieldset')],
  ['Plugin.FormApi.Element.File', require('./plugin/formApi/element/file')],
  ['Plugin.FormApi.Element.FormValidate', require('./plugin/formApi/element/formValidate')],
  ['Plugin.FormApi.Element.GenericRenderable', require('./plugin/formApi/element/genericRenderable')],
  ['Plugin.FormApi.Element.Hidden', require('./plugin/formApi/element/hidden')],
  ['Plugin.FormApi.Element.Password', require('./plugin/formApi/element/password')],
  ['Plugin.FormApi.Element.Radios', require('./plugin/formApi/element/radios')],
  ['Plugin.FormApi.Element.Select', require('./plugin/formApi/element/select')],
  ['Plugin.FormApi.Element.Static', require('./plugin/formApi/element/static')],
  ['Plugin.FormApi.Element.Text', require('./plugin/formApi/element/text')],
  ['Plugin.FormApi.Element.Textarea', require('./plugin/formApi/element/textarea')],

  ['Plugin.FormApi.Form', require('./plugin/formApi/form')],
  ['Plugin.FormApi.FormApiHandler', require('./plugin/formApi/handler/formApiHandler')],

  ['Plugin.Menu', require('./plugin/menu')],
  ['Plugin.Menu.MenuWidget', require('./plugin/menu/widget/menuWidget')],

  // Object Relational Model
  ['Plugin.Orm', require('./plugin/orm')],
  ['Plugin.Orm.Attribute', require('./plugin/orm/attribute')],
  ['Plugin.Orm.Attribute.Float', require('./plugin/orm/attribute/float')],
  ['Plugin.Orm.Attribute.Integer', require('./plugin/orm/attribute/integer')],
  ['Plugin.Orm.Attribute.Text', require('./plugin/orm/attribute/text')],
  ['Plugin.Orm.Entity', require('./plugin/orm/entity')],
  ['Plugin.Orm.Table', require('./plugin/orm/table')],

  ['Plugin.Router', require('./plugin/router')],
  ['Plugin.Router.AccessDeniedHandler', require('./plugin/router/handler/accessDeniedHandler')],
  ['Plugin.Router.AdminHandler', require('./plugin/router/handler/adminHandler')],
  ['Plugin.Router.Item', require('./plugin/router/item')],
  ['Plugin.Router.Handler', require('./plugin/router/handler')],
  ['Plugin.Router.FileHandler', require('./plugin/router/handler/fileHandler')],
  ['Plugin.Router.NotFoundHandler', require('./plugin/router/handler/notFoundHandler')],
  ['Plugin.Router.ServeDirectoryHandler', require('./plugin/router/handler/serveDirectoryHandler')],

  ['Plugin.Http', require('./plugin/http')],
  ['Plugin.Http.Response', require('./plugin/http/response')],
  ['Plugin.Http.Response.File', require('./plugin/http/response/file')],
  ['Plugin.Http.Response.Json', require('./plugin/http/response/json')],
  ['Plugin.Http.Response.Redirect', require('./plugin/http/response/redirect')],
  ['Plugin.Http.Response.ServeDirectory', require('./plugin/http/response/serveDirectory')],
  ['Plugin.Http.Response.Text', require('./plugin/http/response/text')],
  ['Plugin.Http.Response.Themed', require('./plugin/http/response/themed')],

  ['Plugin.QueryApi', require('./plugin/queryApi')],
  ['Plugin.QueryApi.Query', require('./plugin/queryApi/query')],
  ['Plugin.QueryApi.Base', require('./plugin/queryApi/base')],
  ['Plugin.QueryApi.Field', require('./plugin/queryApi/field')],
  ['Plugin.QueryApi.QueryHandler', require('./plugin/queryApi/handler/queryHandler')],
  ['Plugin.QueryApi.AdminQueryHandler', require('./plugin/queryApi/handler/adminQueryHandler')],
  ['Plugin.QueryApi.FieldFormat', require('./plugin/queryApi/renderable/fieldFormat')],
  ['Plugin.QueryApi.InstanceFormat', require('./plugin/queryApi/renderable/instanceFormat')],
  ['Plugin.QueryApi.FormatRegistry', require('./plugin/queryApi/formatRegistry')],
  ['Plugin.QueryApi.baseFormatSet', require('./plugin/queryApi/format/baseFormatSet')],
  ['Plugin.QueryApi.baseFormatSetUl', require('./plugin/queryApi/format/baseFormatSetUl')],
  ['Plugin.QueryApi.baseFormatSetOl', require('./plugin/queryApi/format/baseFormatSetOl')],
  ['Plugin.QueryApi.baseFormatSetTable', require('./plugin/queryApi/format/baseFormatSetTable')],
  ['Plugin.QueryApi.baseFormatSingle', require('./plugin/queryApi/format/baseFormatSingle')],
  ['Plugin.QueryApi.baseFormatSingleUl', require('./plugin/queryApi/format/baseFormatSingleUl')],
  ['Plugin.QueryApi.baseFormatSingleOl', require('./plugin/queryApi/format/baseFormatSingleOl')],
  ['Plugin.QueryApi.baseFormatSingleTable', require('./plugin/queryApi/format/baseFormatSingleTable')],
  ['Plugin.QueryApi.baseFormatSingleTableRow', require('./plugin/queryApi/format/baseFormatSingleTableRow')],

  ['Plugin.Layout', require('./plugin/layout')],
  ['Plugin.Layout.DefaultLayoutRenderable', require('./plugin/layout/layout/defaultLayoutRenderable')],
  ['Plugin.Layout.LayoutRenderable', require('./plugin/layout/layout/layoutRenderable')],
  ['Plugin.Layout.LayoutHandler', require('./plugin/layout/handler/layoutHandler')],
  ['Plugin.Layout.Widget', require('./plugin/layout/widget')],
  ['Plugin.Layout.Widget.ContentWidget', require('./plugin/layout/widget/contentWidget')],
  ['Plugin.Layout.Widget.SiteNameWidget', require('./plugin/layout/widget/siteNameWidget')],
  ['Plugin.Layout.Widget.TitleWidget', require('./plugin/layout/widget/titleWidget')],
  ['Plugin.Layout.WidgetPlacementRenderable', require('./plugin/layout/renderable/widgetPlacementRenderable.js')],
  ['Plugin.Layout.LayoutListHandler', require('./plugin/layout/handler/layoutListHandler')],
  ['Plugin.Layout.LayoutEditForm', require('./plugin/layout/form/layoutEditForm')],
  ['Plugin.Layout.LayoutEditHandler', require('./plugin/layout/handler/layoutEditHandler')],

  ['Plugin.Message', require('./plugin/message')],
  ['Plugin.Message.Container', require('./plugin/message')],
  ['Plugin.Message.MessageHandler', require('./plugin/message/handler/messageHandler')],
  ['Plugin.Message.MessageWidget', require('./plugin/message/widget/messageWidget')],

  ['Plugin.Session', require('./plugin/session')],
  ['Plugin.Session.SessionHandler', require('./plugin/session/handler/sessionHandler')],

  ['Plugin.Settings', require('./plugin/settings')],
  ['Plugin.Settings.Data', require('./plugin/settings/data')],
  ['Plugin.Settings.SettingsClassMapForm', require('./plugin/settings/form/settingsClassMapForm')],
  ['Plugin.Settings.SettingsPathsForm', require('./plugin/settings/form/settingsPathsForm')],

  ['Plugin.ThemeBase', require('./plugin/themeBase')],
  ['Plugin.ThemeBase.Page', require('./plugin/themeBase/renderable/page')],

  ['Plugin.ThemeBootstrap', require('./plugin/themeBootstrap')],
  ['Plugin.ThemeBootstrap.Page', require('./plugin/themeBootstrap/renderable/page')],

  ['Plugin.Theme', require('./plugin/theme')],
  ['Plugin.Theme.Renderable', require('./plugin/theme/renderable')],
  ['Plugin.Theme.Collection', require('./plugin/theme/renderable/collection')],
  ['Plugin.Theme.DefaultThemeHandler', require('./plugin/theme/handler/defaultThemeHandler')],

  ['Plugin.Example', require('./plugin/example')],
  ['Plugin.Example.AdminHandler', require('./plugin/example/handler/adminHandler')],
  ['Plugin.Example.AlwaysProcessHandler', require('./plugin/example/handler/alwaysProcessHandler')],
  ['Plugin.Example.FrontPageHandler', require('./plugin/example/handler/frontPageHandler')],
  ['Plugin.Example.TextHandler', require('./plugin/example/handler/textHandler')],
  ['Plugin.Example.JsonHandler', require('./plugin/example/handler/jsonHandler')],
  ['Plugin.Example.ThemedHandler', require('./plugin/example/handler/themedHandler')],
  ['Plugin.Example.ExampleFileUploadForm', require('./plugin/example/form/exampleFileUploadForm')],
  ['Plugin.Example.ExampleFileUploadTable', require('./plugin/example/table/exampleFileUploadTable')],
  ['Plugin.Example.ExampleForm', require('./plugin/example/form/exampleForm')],
  ['Plugin.Example.FileUploadListRenderable', require('./plugin/example/renderable/fileUploadListRenderable')],
  ['Plugin.Example.ServeUploadedFileHandler', require('./plugin/example/handler/serveUploadedFileHandler')],
].map(([name, obj]) => buildRecursive(name, obj, Defiant));

module.exports = Defiant;
