"use strict";

const AdminHandler = require('../../router/handler/adminHandler');
const Themed = require('../../http/response/themed');
const {coroutine: co, promisify} = require('bluebird');

class LayoutListHandler extends AdminHandler {
  init(context) {
    return co(function*(self, superInit) {
      yield superInit.call(self, context);
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
    })(this, super.init);
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
