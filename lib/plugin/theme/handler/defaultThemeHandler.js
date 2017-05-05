"use strict";

const Handler = require('../../router/handler');
const Registry = require('../../../util/registry');
const {coroutine: co} = require('bluebird');

class DefaultThemeHandler extends Handler {
  init(context) {
    return co(function*(self, superInit){
      superInit.call(self, context);

      // Create the CSS & Javascript registries.
      context.css = new Registry();
      context.js = new Registry();
      context.jsFooter = new Registry();

      // Set the theme.
      // TODO: Choose a theme based on path, similar to Layouts.
      context.theme = context.engine.plugin.get('ThemeBase');
    })(this, super.init);
  }
}

DefaultThemeHandler.id = 'Theme.DefaultThemeHandler';
DefaultThemeHandler.path = '';
DefaultThemeHandler.weight = -9999;

module.exports = DefaultThemeHandler;
