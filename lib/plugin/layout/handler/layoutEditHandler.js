"use strict";

const AdminHandler = require('../../router/handler/adminHandler');
const Themed = require('../../http/response/themed');
const {coroutine: co, promisify} = require('bluebird');

class LayoutEditHandler extends AdminHandler {
  allowAccess(context) {
    return co(function*(self, superAllowAccess){
      if (yield superAllowAccess.call(self, context)) {
        // Deny Access if the layout does not exist.
        let layoutId = context.request.urlTokenized[3]
        let layout = context.engine.pluginRegistry.get('Layout').layouts.get(layoutId);
        let layoutData = context.engine.pluginRegistry.get('Settings').cache.get(`layout/${layoutId}.json`);
        if (layout && layoutData) {
          // The requested layout exists.
          return true;
        }
        // The requested path could not be found.
        context.httpResponse = 404;
        return false;
      }
      return false;
    })(this, super.allowAccess);
  }
  init(context) {
    let path = context.request._parsedUrl.pathname;
    let form = new (context.engine.pluginRegistry.get('FormApi').getForm('LayoutEditForm'))({
      layoutId: context.request.urlTokenized[3],
    });
    let theme = context.theme;
    return co(function*(self, superInit) {
      yield superInit.call(self, context);
      yield form.init(context);
      context.httpResponse = new Themed(context, {
        language: 'us',
        siteName: 'Defiant',
        head: '',
        jsFooter: '',
        content: form.commit(),
      });
    })(this, super.init);
  }
}

LayoutEditHandler.id = 'Layout.LayoutEditHandler';
LayoutEditHandler.path = 'admin/layout/edit/*';

module.exports = LayoutEditHandler;
