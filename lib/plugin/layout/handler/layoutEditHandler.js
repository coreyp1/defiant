"use strict";

const AdminHandler = require('../../router/handler/adminHandler');
const Themed = require('../../http/response/themed');

class LayoutEditHandler extends AdminHandler {
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
