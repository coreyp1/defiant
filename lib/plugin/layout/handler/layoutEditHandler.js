"use strict";

const AdminHandler = require('../../router/handler/adminHandler');
const Themed = require('../../http/response/themed');

/**
 * Provide a form for editing the settings of a
 * [LayoutRenderable]{@link Defiant.Plugin.Layout.LayoutRenderable}.
 * @class
 * @extends Defiant.Plugin.Router.AdminHandler
 * @memberOf Defiant.Plugin.Layout
 */
class LayoutEditHandler extends AdminHandler {
  /**
   * Determine whether or not this handler will allow access to the url in
   * [context.request]{@link Defiant.Context#request}.  May also set
   * [context.httpResponse]{@link Defiant.Context#httpResponse}.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   **/
  async allowAccess(context) {
    if (await super.allowAccess(context)) {
      // Deny Access if the layout does not exist.
      let layoutId = context.request.urlTokenized[3]
      let layout = context.engine.pluginRegistry.get('Layout').layoutRegistry.get(layoutId);
      let layoutData = context.engine.pluginRegistry.get('Settings').cacheRegistry.get(`layout/${layoutId}.json`);
      if (layout && layoutData) {
        // The requested layout exists.
        return true;
      }
      // The requested path could not be found.
      context.httpResponse = 404;
      return false;
    }
    return false;
  }

  /**
   * A request has been made.  Process the request and provide the necessary
   * [Renderable]{@link Defiant.Plugin.Theme.Renderable}.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
    let form = context.engine.pluginRegistry.get('FormApi').getForm('LayoutEditForm');
    let formInstance = form.newInstance(context, {
      buildState: {
        layoutId: context.request.urlTokenized[3],
      },
    });
    // TODO: Translate
    context.page.title = "Layout Editor";
    await super.init(context);
    await formInstance.init();
    context.httpResponse = new Themed(context, {
      language: 'us',
      siteName: 'Defiant',
      head: '',
      jsFooter: '',
      content: await formInstance.commit(),
    });
  }
}

LayoutEditHandler.id = 'Layout.LayoutEditHandler';
LayoutEditHandler.path = 'admin/layout/edit/*';

module.exports = LayoutEditHandler;
