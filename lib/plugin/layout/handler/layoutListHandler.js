"use strict";

const AdminHandler = require('../../router/handler/adminHandler');
const Themed = require('../../http/response/themed');

/**
 * List the current layouts and provide an edit link.
 * @class
 * @extends Defiant.Plugin.Router.AdminHandler
 * @memberOf Defiant.Plugin.Layout
 */
class LayoutListHandler extends AdminHandler {
  /**
   * A request has been made.  Process the request and provide the necessary
   * [Renderable]{@link Defiant.Plugin.Theme.Renderable}.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
    await super.init(context);
    let content = '';
    // Populate the layout edit list.
    for (let layout of context.engine.pluginRegistry.get('Layout').layoutRegistry.getOrderedElements()) {
      content += `<a href="/admin/layout/edit/${layout.id}">${layout.id}</a><br />`;
    }
    context.httpResponse = new Themed(context, {
      language: 'us',
      siteName: 'Defiant',
      head: '',
      jsFooter: '',
      content: content,
    });
  }
}

LayoutListHandler.id = 'Layout.LayoutListHandler';
LayoutListHandler.path = 'admin/layout';
// TODO: Translate
LayoutListHandler.menu = {
  menu: 'admin',
  text: 'Layouts',
  description: 'Create and edit Layouts for your website',
};

module.exports = LayoutListHandler;
