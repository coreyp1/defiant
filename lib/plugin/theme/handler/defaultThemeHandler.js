"use strict";

const Handler = require('../../router/handler');
const Registry = require('../../../util/registry');

class DefaultThemeHandler extends Handler {
  async init(context) {
    await super.init(context);

    // Create the CSS & Javascript registries.
    context.cssRegistry = new Registry();
    context.jsRegistry = new Registry();
    context.jsFooterRegistry = new Registry();

    // Set the theme.
    // TODO: Choose a theme based on path, similar to Layouts.
    context.theme = context.engine.pluginRegistry.get('ThemeBase');
  }
}

DefaultThemeHandler.id = 'Theme.DefaultThemeHandler';
DefaultThemeHandler.path = '';
DefaultThemeHandler.weight = -9999;

module.exports = DefaultThemeHandler;
