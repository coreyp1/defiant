"use strict";

const AdminHandler = require('../../router/handler/adminHandler');
const Themed = require('../../http/response/themed');

class ExampleAdminHandler extends AdminHandler {
  async init(context) {
    const Router = context.engine.pluginRegistry.get('Router');

    // Dynamically generate a list of admin links.
    let group = {};
    for (let handler of getAdminItems(Router.router.subquery.get('admin'))) {
      let pos = handler.id.indexOf('.');
      let groupName = pos >= 0 ? handler.id.substring(0, pos) : handler.id;
      if (!group[groupName]) {
        group[groupName] = [];
      }
      group[groupName].push(handler)
    }
    let content = '<table>';
    for (let groupName of Object.keys(group).sort()) {
      content += `<tr><th colspan=2>${groupName}</th></tr>`;
      for (let handler of group[groupName]) {
        content += `<tr><td><a href="${handler.path}">${handler.menu.text}</a></td><td>${handler.menu.description}</td></tr>`;
      }
    }
    content += '</table>';

    context.httpResponse = new Themed(context, {
      language: 'us',
      siteName: 'Defiant',
      head: '',
      jsFooter: '',
      content: content,
    });
  }
}

/**
 * Recursively assemble a list of all handlers from the admin/* path that have
 * a menu setting, but do not have a wildcard (*) in the path.
 */
function getAdminItems(item) {
  let items = [];
  for (let handler of item.handlerRegistry.getIterator()) {
    if (handler.path && (handler.path.indexOf('*') == -1) && handler.menu) {
      items.push(handler);
    }
  }
  for (let subitem of item.subquery.values()) {
    items.push(...getAdminItems(subitem));
  }
  return items;
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
