"use strict";

const Handler = require('../../router/handler');

class LayoutHandler extends Handler {
  async init(context) {
    await super.init(context);
    let Layout = context.engine.pluginRegistry.get('Layout');
    // Set the default layout.
    context.layout = Layout.layoutRegistry.get('defaultLayout');
    // Set up page variables.
    context.page = {};
  }
}

LayoutHandler.id = 'Layout.LayoutHandler';
LayoutHandler.path = '';
LayoutHandler.weight = -400;

module.exports = LayoutHandler;
