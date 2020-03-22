"use strict";

const Plugin = require('../plugin');

/**
 * The Theme plugin is a framework for handling themeable output.
 *
 * Other plugins may add their own themable elements (called
 * [Renderables]{@link Defiant.Plugin.Theme.Renderable}) or may override or
 * augment the Renderables created by other plugins.
 *
 * [Theme sets]{@link Defiant.Plugin.ThemeBase} are then collections of
 * Renderables to complement or override the core Renderables.
 * @class
 * @extends Plugin
 * @memberOf Defiant.Plugin
 */
class Theme extends Plugin {

  /**
   * @param {Defiant.Engine} engine
   *   The app engine
   * @returns {Defiant.Plugin.Theme}
   *   The instantiated Theme plugin.
   */
  constructor(engine) {
    super(engine);

    engine.pluginRegistry.get('Router')
      .addHandler(new (require('./handler/defaultThemeHandler'))());

    // Register Theme elements
    engine.pluginRegistry.get('ThemeBase')
      .setRenderable(require('./renderable/tagSingle.js'))
      .setRenderable(require('./renderable/tagPair.js'));
  }
}

module.exports = Theme;
