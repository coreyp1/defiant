"use strict";

const Handler = require('../router/handler');

class DefaultThemeHandler extends Handler {
  init(context) {
    context.theme = context.engine.plugin.get('ThemeBase');
    return Promise.resolve();
  }
}

DefaultThemeHandler.id = 'Theme.DefaultThemeHandler';
DefaultThemeHandler.path = '';
DefaultThemeHandler.weight = -9999;

module.exports = DefaultThemeHandler;
