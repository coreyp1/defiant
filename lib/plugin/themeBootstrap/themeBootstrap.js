"use strict";

const ThemeBase = require('../themeBase');
const ServeDirectoryHandler = require('../router/handler/serveDirectoryHandler');
const Plugin = require('../plugin');
const path = require('path');

/**
 * The Bootstrap theme as a subtheme of ThemeBase.
 * @class
 * @extends Defiant.Plugin.ThemeBase
 * @memberOf Defiant.Plugin
 */
class ThemeBootstrap extends ThemeBase {
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
        // Add the default Renderables.
        for (let renderable of [
          require('./renderable/page'),
        ]) {
          this.setRenderable(renderable);
        }

        for (let existingPlugin of ['Library'].map(name => this.engine.pluginRegistry.get(name))) {
          if (existingPlugin instanceof Plugin) {
            await this.notify(existingPlugin, 'enable');
          }
        }
        break; // pre:enable

      case 'enable':
        switch ((plugin || {}).id) {
          case 'Library':
            // Register the Bootstrap CSS and JavaScript with the
            // [Library]{@link Defiant.Library}.
            plugin.register({
              id: 'Bootstrap',
              require: ['jQueryUI'],
              css: [{
                id: 'Bootstrap',
                url: '/file/theme/bootstrap/css/bootstrap.css',
                path: path.join(path.dirname(require.resolve('bootstrap')), '../css/bootstrap.css'),
              }, {
                id: 'ThemeBootstrap',
                url: '/file/theme/themeBootstrap/css/themeBootstrap.css',
                path: path.join(__dirname, 'file/css/themeBootstrap.css'),
              }],
              jsFooter: [{
                id: 'Bootstrap',
                url: '/file/theme/bootstrap/js/bootstrap.min.js',
                path: path.join(path.dirname(require.resolve('bootstrap')), '../js/bootstrap.js'),
              }, {
                id: 'ThemeBootstrap',
                url: '/file/theme/themeBootstrap/js/themeBootstrap.js',
                path: path.join(__dirname, 'file/js/themeBootstrap.js'),
              }],
            });
            break; // Library

          case 'Router':
            plugin
              // Serve default CSS & JavaScript files.
              .addHandler(new ServeDirectoryHandler({
                id: 'ThemeBootstrap.DirectoryHandler',
                path: 'file/theme/themeBootstrap',
                target: path.join(__dirname, 'file'),
                menu: undefined,
                fileOptions: {},
                directoryOptions: undefined,
              }))
              // Serve Bootstrap files.
              .addHandler(new ServeDirectoryHandler({
                id: 'ThemeBootstrap.BootstrapDirectoryHandler',
                path: 'file/theme/bootstrap',
                target: path.join(path.dirname(require.resolve('bootstrap')), '..'),
                menu: undefined,
                fileOptions: {},
                directoryOptions: undefined,
              }));
            break; // Router
        }
        break; // enable

      case 'pre:disable':
        // @todo: Remove entries from Library, Router.
        break; // pre:disable
    }
  }
}

module.exports = ThemeBootstrap;
