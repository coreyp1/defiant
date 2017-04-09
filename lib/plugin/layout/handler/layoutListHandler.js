"use strict";

const AdminHandler = require('../../router/adminHandler');
const Themed = require('../../http/response/themed');
const {coroutine: co, promisify} = require('bluebird');

class LayoutListHandler extends AdminHandler {
  init(context) {
    return co(function*(self) {
      let content = '';
      // Populate the layout edit list.
      for (let layout of context.engine.plugin.get('Layout').layouts.getOrderedElements()) {
        content += `<a href="/admin/layout/edit/${layout.id}">${layout.id}</a><br />`;
      }
      context.httpResponse = new Themed(context, {
        language: 'us',
        siteName: 'Defiant',
        head: '',
        jsFooter: '',
        content: content,
      });
    })(this);
  }
}

LayoutListHandler.id = 'Layout.LayoutListHandler';
LayoutListHandler.path = 'admin/layout';

module.exports = LayoutListHandler;
