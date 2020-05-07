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
   * Process a notification that some `plugin` has performed some `action`.
   * @function
   * @async
   * @param {Defiant.Plugin} plugin
   *   The Plugin to which the `action` pertains.
   * @param {String} action
   *   The action being performed.  Example actions include "pre-enable",
   *   "enable", "disable", "update".
   * @param {Mixed} [data=NULL]
   *   Any supplementary information.
   */
  async notify(plugin, action, data=null) {
    super.notify(plugin, action, data);
    switch (action) {
      case 'pre:enable':
        break; // pre-enable

      case 'enable':
        switch ((plugin || {}).id) {
          case 'ThemeBase':
            plugin
              .setRenderable(require('./renderable/tagSingle.js'))
              .setRenderable(require('./renderable/tagPair.js'));
            break; // ThemeBase

          case 'Router':
            plugin
              .addHandler(new (require('./handler/defaultThemeHandler'))());
            break; // Router

          case this.id:
            // Run the setup for any previously-enabled plugins.
            for (let existingPlugin of ['ThemeBase', 'Router'].map(name => this.engine.pluginRegistry.get(name))) {
              if (existingPlugin instanceof Plugin) {
                await this.notify(existingPlugin, 'enable');
              }
            }
            break; // this.id
        }
        break; // enable

      case 'pre:disable':
        // @todo: Remove Renderables from ThemeBase.
        // @todo: Remove handlers from Router.
        break; // pre:disable
    }
  }
}

module.exports = Theme;
