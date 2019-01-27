"use strict";

const AdminHandler = require('../../router/handler/adminHandler');
const Themed = require('../../http/response/themed');

class ExampleAdminHandler extends AdminHandler {
  async init(context) {
    let content = '';
    let paths = {
      'Layout.LayoutListHandler': 'admin/layout',
      'Settings.PathsHandler': 'admin/settings/paths',
      'Settings.ClassMapHandler': 'admin/settings/class_map',
      'Account.Accounts': 'admin/accounts',
    };
    Object.keys(paths).map(key => {
      content += `<a href="/${paths[key]}">${key}</a><br />`;
    });
    context.httpResponse = new Themed(context, {
      language: 'us',
      siteName: 'Defiant',
      head: '',
      jsFooter: '',
      content: content,
    });
  }
}

ExampleAdminHandler.id = 'Example.AdminHandler';
ExampleAdminHandler.path = 'example.admin';
// TODO: Translate
ExampleAdminHandler.menu = {
  menu: 'default',
  text: 'Admin',
  description: 'Administer this website',
};

module.exports = ExampleAdminHandler;
