"use strict";

const Handler = require('../../router/handler');
const Registry = require('../../../util/registry');

/**
 * Add the theme components to the request `context` and set the theme.
 * @todo Choose a theme based on some criteria (e.g, path).
 * @class
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.Theme
 */
class DefaultThemeHandler extends Handler {
  async init(context) {
    await super.init(context);

    // Create the CSS & Javascript registries.
    /**
     * @member {Defiant.util.Registry} Defiant.Context#cssRegistry
     *   CSS entries to be added to the request.
     */
    context.cssRegistry = new Registry();
    /**
     * @member {Defiant.util.Registry} Defiant.Context#jsRegistry
     *   JavaScript to be added to the request header section.
     */
    context.jsRegistry = new Registry();
    /**
     * @member {Defiant.util.Registry} Defiant.Context#jsFooterRegistry
     *   JavaScript to be added to the request footer section.
     */
    context.jsFooterRegistry = new Registry();

    // Set the theme.
    /**
     * @member {Defiant.util.Registry} Defiant.Context#theme
     *   The [theme set]{@link Defiant.Plugin.ThemeBase} for this request.
     */
    context.theme = context.engine.pluginRegistry.get('ThemeBase');
  }
}

DefaultThemeHandler.id = 'Theme.DefaultThemeHandler';
DefaultThemeHandler.path = '';
DefaultThemeHandler.weight = -9999;

module.exports = DefaultThemeHandler;
