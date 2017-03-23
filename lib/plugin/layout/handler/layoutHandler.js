"use strict";

const Handler = require('../../router/handler');
const {coroutine: co, promisify} = require('bluebird');

class LayoutHandler extends Handler {
  init(context) {
    return co(function*(self) {
      let Layout = context.engine.plugin.get('Layout');
      // Set the default layout.
      context.layout = Layout.layouts.get('defaultLayout');
    })(this);
  }
}

LayoutHandler.id = 'Layout.LayoutHandler';
LayoutHandler.path = '';
LayoutHandler.weight = -400;

module.exports = LayoutHandler;
