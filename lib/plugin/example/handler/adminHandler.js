"use strict";

const AdminHandler = require('../../router/handler/adminHandler');
const Themed = require('../../http/response/themed');

/**
 * Example handler that creates an administrative page that shows admin links
 * from the Menu API.
 * @class
 * @extends Defiant.Plugin.Router.AdminHandler
 * @memberOf Defiant.Plugin.Example
 */
class ExampleAdminHandler extends AdminHandler {
  /**
   * A request has been made.  Process the request and provide the necessary
   * [Renderable]{@link Defiant.Plugin.Theme.Renderable}.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
    const Router = context.engine.pluginRegistry.get('Router');

    // Dynamically generate a list of admin links.
    let group = {};
    for (let handler of getAdminItems(Router.router.subquery.get('admin'))) {
      if (await handler.allowAccess(context)) {
        let pos = handler.id.indexOf('.');
        let groupName = pos >= 0 ? handler.id.substring(0, pos) : handler.id;
        if (!group[groupName]) {
          group[groupName] = [];
        }
        group[groupName].push(handler);
      }
    }
    let content = '<table>';
    for (let groupName of Object.keys(group).sort()) {
      content += `<tr><th colspan=3>${groupName}</th></tr>`;
      for (let handler of group[groupName]) {
        content += `<tr><td></td><td><a href="${handler.path}">${handler.menu.text}</a></td><td>${handler.menu.description}</td></tr>`;
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
 * @name Defiant.Plugin.Example.ExampleAdminHandler.getAdminItems
 * @function
 * @param {Defiant.Plugin.Router.Item} item
 *   The parent item.
 * @returns {Defiant.Plugin.Router.Item[]}
 *   An array of admin items.
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
