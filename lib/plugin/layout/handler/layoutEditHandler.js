"use strict";

const AdminHandler = require('../../router/adminHandler');
const Themed = require('../../http/response/themed');
const {coroutine: co, promisify} = require('bluebird');

class LayoutEditHandler extends AdminHandler {
  init(context) {
    let path = context.request._parsedUrl.pathname;
    let form = new (context.engine.plugin.get('Fapi').getForm('LayoutEditForm'))({
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
