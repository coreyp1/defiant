"use strict";

const Plugin = require('../plugin');
const Renderable = require('../theme/renderable');
const InitRegistry = require('../../util/initRegistry');
const ServeDirectoryHandler = require('../router/handler/serveDirectoryHandler');
const path = require('path');
const fs = require('fs');

/**
 * ThemeBase is the class that all theme sets should be a subclass of.
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Plugin
 */
class ThemeBase extends Plugin {
  /**
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
        /**
         * @member {Defiant.util.InitRegistry} Defiant.Plugin.ThemeBase#renderables
         *   A registry of all the Renderables provided by this theme set.
         */
        this.renderables = new InitRegistry({}, [this.engine]);

        /**
         * @member {String} Defiant.Plugin.ThemeBase#parentName
         *   The name of the parent theme set.
         */
        this.parentName = Object.getPrototypeOf(Object.getPrototypeOf(this)).constructor.name;

        /**
         * @member {Defiant.Plugin.ThemeBase} Defiant.Plugin.ThemeBase#parent
         *   The Class of the parent theme set.
         */
        this.parent = this.parentName != 'Plugin' ? this.engine.pluginRegistry.get(this.parentName) : undefined;

        // Add the default Renderables.
        for (let renderable of [
          require('./renderable/page'),
        ]) {
          this.setRenderable(renderable);
        }

        for (let existingPlugin of ['Router'].map(name => this.engine.pluginRegistry.get(name))) {
          if (existingPlugin instanceof Plugin) {
            await this.notify(existingPlugin, 'enable');
          }
        }
        break; // pre:enable

      case 'enable':
        switch ((plugin || {}).id) {
          case 'Router':
            plugin
              // Serve default CSS & JavaScript files.
              .addHandler(new ServeDirectoryHandler({
                id: 'ThemeBase.DirectoryHandler',
                path: 'file/theme/themeBase',
                target: path.join(__dirname, 'file'),
                menu: undefined,
                fileOptions: {},
                directoryOptions: undefined,
              }));
            break; // Router

          default:
            // Populate this.parent, in the event that the parent theme plugin
            // is loaded after the child theme.
            if (!this.parent && this.parentName != 'Plugin') {
              this.parent = this.engine.pluginRegistry.get(this.parentName);
            }
            break; // default
        }
        break; // enable

      case 'pre:disable':
        // @todo Cleanup entries in Router.
        break; // pre:disable
    }
  }

  /**
   * Add a Renderable to the ThemeBase.
   * @function
   * @param {Defiant.Plugin.Theme.Renderable} renderable
   *   Add a renderable to the ThemeBase.
   * @returns {Defiant.Plugin.ThemeBase}
   *   The ThemeBase.
   */
  setRenderable(renderable) {
    this.renderables.set(renderable);
    if (renderable.templateFile) {
      renderable.templateContents = fs.readFileSync(renderable.templateFile);
      renderable.templateFunction = Renderable.compileTemplate(renderable.variables, renderable.templateContents, renderable.boilerplate);
    }
    return this;
  }

  /**
   * Get the Renderable that matches the argument `name`.
   *
   * If this theme set does not have an entry for the requested Renderable,
   * then check the parent theme recursively.
   * @function
   * @param {String} name
   *   The name of the Renderable.
   * @returns {Defiant.Plugin.Theme.Renderable}
   *   The renderable matching the requested `name`.
   */
  getRenderable(name) {
    return this.renderables.get(name) || (this.parent ? this.parent.getRenderable(name) : undefined);
  }
}

module.exports = ThemeBase;
