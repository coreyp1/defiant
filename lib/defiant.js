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
  ['util.InitRegistry', require('./util/initRegistry')],
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
  ['Plugin.Account.AccountsHandler', require('./plugin/account/handler/accountsHandler')],
  ['Plugin.Account.AccountLoadHandler', require('./plugin/account/handler/accountLoadHandler')],
  ['Plugin.Account.ChangePasswordFormInstance', require('./plugin/account/form/changePasswordFormInstance')],
  ['Plugin.Account.LoginFormInstance', require('./plugin/account/form/loginFormInstance')],
  ['Plugin.Account.LogoutHandler', require('./plugin/account/handler/logoutHandler')],
  ['Plugin.Account.AccountQuery', require('./plugin/account/query/accountQuery')],
  ['Plugin.Account.AccountsQuery', require('./plugin/account/query/accountsQuery')],

  ['Plugin.FileApi', require('./plugin/fileApi')],
  ['Plugin.FileApi.FileTable', require('./plugin/fileApi/table/fileTable')],
  ['Plugin.FileApi.LocalManager', require('./plugin/fileApi/manager/localManager')],
  ['Plugin.FileApi.LocalManagerHandler', require('./plugin/fileApi/handler/localManagerHandler')],
  ['Plugin.FileApi.Manager', require('./plugin/fileApi/manager')],

  ['Plugin.FormApi', require('./plugin/formApi')],
  ['Plugin.FormApi.Element', require('./plugin/formApi/element')],
  ['Plugin.FormApi.Element.ButtonInstance', require('./plugin/formApi/element/buttonInstance')],
  ['Plugin.FormApi.Element.CheckboxesInstance', require('./plugin/formApi/element/checkboxesInstance')],
  ['Plugin.FormApi.Element.EncryptInstance', require('./plugin/formApi/element/encryptInstance')],
  ['Plugin.FormApi.Element.FieldsetInstance', require('./plugin/formApi/element/fieldsetInstance')],
  ['Plugin.FormApi.Element.FileInstance', require('./plugin/formApi/element/fileInstance')],
  ['Plugin.FormApi.Element.FormValidateInstance', require('./plugin/formApi/element/formValidateInstance')],
  ['Plugin.FormApi.Element.GenericRenderableInstance', require('./plugin/formApi/element/genericRenderableInstance')],
  ['Plugin.FormApi.Element.HiddenInstance', require('./plugin/formApi/element/hiddenInstance')],
  ['Plugin.FormApi.Element.PasswordInstance', require('./plugin/formApi/element/passwordInstance')],
  ['Plugin.FormApi.Element.RadiosInstance', require('./plugin/formApi/element/radiosInstance')],
  ['Plugin.FormApi.Element.SelectInstance', require('./plugin/formApi/element/selectInstance')],
  ['Plugin.FormApi.Element.StaticInstance', require('./plugin/formApi/element/staticInstance')],
  ['Plugin.FormApi.Element.TextInstance', require('./plugin/formApi/element/textInstance')],
  ['Plugin.FormApi.Element.TextareaInstance', require('./plugin/formApi/element/textareaInstance')],

  ['Plugin.FormApi.Form', require('./plugin/formApi/form')],
  ['Plugin.FormApi.FormApiHandler', require('./plugin/formApi/handler/formApiHandler')],

  ['Plugin.Menu', require('./plugin/menu')],
  ['Plugin.Menu.MenuWidget', require('./plugin/menu/widget/menuWidget')],
  ['Plugin.Menu.MenuWidgetInstance', require('./plugin/menu/widget/menuWidgetInstance')],

  // Object Relational Model
  ['Plugin.Orm', require('./plugin/orm')],
  ['Plugin.Orm.Attribute', require('./plugin/orm/attribute')],
  ['Plugin.Orm.Attribute.Float', require('./plugin/orm/attribute/float')],
  ['Plugin.Orm.Attribute.Integer', require('./plugin/orm/attribute/integer')],
  ['Plugin.Orm.Attribute.Text', require('./plugin/orm/attribute/text')],
  ['Plugin.Orm.Entity', require('./plugin/orm/entity')],
  ['Plugin.Orm.Table', require('./plugin/orm/table')],
  ['Plugin.Orm.UuidField', require('./plugin/orm/field/uuidField')],
  ['Plugin.Orm.FieldFormatUuidLink', require('./plugin/orm/format/fieldFormatUuidLink')],
  ['Plugin.Orm.EntityEditForm', require('./plugin/orm/form/entityEditForm')],
  ['Plugin.Orm.EntityEditFormInstance', require('./plugin/orm/form/entityEditFormInstance')],
  ['Plugin.Orm.EntityCreateHandler', require('./plugin/orm/handler/entityCreateHandler')],
  ['Plugin.Orm.EntityEditHandler', require('./plugin/orm/handler/entityEditHandler')],

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
  ['Plugin.QueryApi.baseFormatSetCsv', require('./plugin/queryApi/format/baseFormatSetCsv')],
  ['Plugin.QueryApi.baseFormatSetTable', require('./plugin/queryApi/format/baseFormatSetTable')],
  ['Plugin.QueryApi.baseFormatSingle', require('./plugin/queryApi/format/baseFormatSingle')],
  ['Plugin.QueryApi.baseFormatSingleUl', require('./plugin/queryApi/format/baseFormatSingleUl')],
  ['Plugin.QueryApi.baseFormatSingleOl', require('./plugin/queryApi/format/baseFormatSingleOl')],
  ['Plugin.QueryApi.baseFormatSingleCsv', require('./plugin/queryApi/format/baseFormatSingleCsv')],
  ['Plugin.QueryApi.baseFormatSingleCsvRow', require('./plugin/queryApi/format/baseFormatSingleCsvRow')],
  ['Plugin.QueryApi.baseFormatSingleTable', require('./plugin/queryApi/format/baseFormatSingleTable')],
  ['Plugin.QueryApi.baseFormatSingleTableRow', require('./plugin/queryApi/format/baseFormatSingleTableRow')],
  ['Plugin.QueryApi.fieldFormat', require('./plugin/queryApi/format/fieldFormat')],
  ['Plugin.QueryApi.fieldFormatRaw', require('./plugin/queryApi/format/fieldFormatRaw')],

  ['Plugin.Layout', require('./plugin/layout')],
  ['Plugin.Layout.LayoutRenderable', require('./plugin/layout/layout/layoutRenderable')],
  ['Plugin.Layout.LayoutRenderableInstance', require('./plugin/layout/layout/layoutRenderableInstance')],
  ['Plugin.Layout.LayoutHandler', require('./plugin/layout/handler/layoutHandler')],
  ['Plugin.Layout.Widget', require('./plugin/layout/widget')],
  ['Plugin.Layout.WidgetInstance', require('./plugin/layout/widget/widgetInstance')],
  ['Plugin.Layout.Widget.ContentWidget', require('./plugin/layout/widget/contentWidget')],
  ['Plugin.Layout.Widget.SiteNameWidget', require('./plugin/layout/widget/siteNameWidget')],
  ['Plugin.Layout.Widget.SiteNameWidgetInstance', require('./plugin/layout/widget/siteNameWidgetInstance')],
  ['Plugin.Layout.Widget.TitleWidget', require('./plugin/layout/widget/titleWidget')],
  ['Plugin.Layout.Widget.TitleWidgetInstance', require('./plugin/layout/widget/titleWidgetInstance')],
  ['Plugin.Layout.WidgetPlacementRenderable', require('./plugin/layout/renderable/widgetPlacementRenderable.js')],
  ['Plugin.Layout.LayoutListHandler', require('./plugin/layout/handler/layoutListHandler')],
  ['Plugin.Layout.LayoutEditFormInstance', require('./plugin/layout/form/layoutEditFormInstance')],
  ['Plugin.Layout.LayoutEditHandler', require('./plugin/layout/handler/layoutEditHandler')],

  ['Plugin.Message', require('./plugin/message')],
  ['Plugin.Message.ContainerInstance', require('./plugin/message/renderable/containerInstance')],
  ['Plugin.Message.MessageHandler', require('./plugin/message/handler/messageHandler')],
  ['Plugin.Message.MessageWidget', require('./plugin/message/widget/messageWidget')],

  ['Plugin.Session', require('./plugin/session')],
  ['Plugin.Session.SessionHandler', require('./plugin/session/handler/sessionHandler')],

  ['Plugin.Settings', require('./plugin/settings')],
  ['Plugin.Settings.Data', require('./plugin/settings/data')],
  ['Plugin.Settings.SettingsClassMapFormInstance', require('./plugin/settings/form/settingsClassMapFormInstance')],
  ['Plugin.Settings.SettingsPathsFormInstance', require('./plugin/settings/form/settingsPathsFormInstance')],

  ['Plugin.ThemeBase', require('./plugin/themeBase')],
  ['Plugin.ThemeBase.Page', require('./plugin/themeBase/renderable/page')],
  ['Plugin.ThemeBase.PageInstance', require('./plugin/themeBase/renderable/pageInstance')],

  ['Plugin.ThemeBootstrap', require('./plugin/themeBootstrap')],
  ['Plugin.ThemeBootstrap.Page', require('./plugin/themeBootstrap/renderable/page')],

  ['Plugin.Theme', require('./plugin/theme')],
  ['Plugin.Theme.Renderable', require('./plugin/theme/renderable')],
  ['Plugin.Theme.RenderableInstance', require('./plugin/theme/renderable/renderableInstance')],
  ['Plugin.Theme.Collection', require('./plugin/theme/renderable/collection')],
  ['Plugin.Theme.CollectionInstance', require('./plugin/theme/renderable/collectionInstance')],
  ['Plugin.Theme.DefaultThemeHandler', require('./plugin/theme/handler/defaultThemeHandler')],

  ['Plugin.Example', require('./plugin/example')],
  ['Plugin.Example.AdminHandler', require('./plugin/example/handler/adminHandler')],
  ['Plugin.Example.AlwaysProcessHandler', require('./plugin/example/handler/alwaysProcessHandler')],
  ['Plugin.Example.FrontPageHandler', require('./plugin/example/handler/frontPageHandler')],
  ['Plugin.Example.TextHandler', require('./plugin/example/handler/textHandler')],
  ['Plugin.Example.JsonHandler', require('./plugin/example/handler/jsonHandler')],
  ['Plugin.Example.ThemedHandler', require('./plugin/example/handler/themedHandler')],
  ['Plugin.Example.ExampleFileUploadFormInstance', require('./plugin/example/form/exampleFileUploadFormInstance')],
  ['Plugin.Example.ExampleFileUploadTable', require('./plugin/example/table/exampleFileUploadTable')],
  ['Plugin.Example.ExampleFormInstance', require('./plugin/example/form/exampleFormInstance')],
  ['Plugin.Example.FileUploadListRenderable', require('./plugin/example/renderable/fileUploadListRenderable')],
  ['Plugin.Example.ServeUploadedFileHandler', require('./plugin/example/handler/serveUploadedFileHandler')],
].map(([name, obj]) => buildRecursive(name, obj, Defiant));

module.exports = Defiant;
