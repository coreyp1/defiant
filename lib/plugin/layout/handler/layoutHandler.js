"use strict";

const Handler = require('../../router/handler');
const {coroutine: co, promisify} = require('bluebird');

class LayoutHandler extends Handler {
  init(context) {
    return co(function*(self, superInit) {
      yield superInit.call(self, context);
      let Layout = context.engine.pluginRegistry.get('Layout');
      // Set the default layout.
      context.layout = Layout.layoutRegistry.get('defaultLayout');
      // Set up page variables.
      context.page = {};
    })(this, super.init);
  }
}

LayoutHandler.id = 'Layout.LayoutHandler';
LayoutHandler.path = '';
LayoutHandler.weight = -400;

module.exports = LayoutHandler;
