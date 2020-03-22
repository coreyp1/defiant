"use strict";

const ThemeBase = require('../themeBase');
const ServeDirectoryHandler = require('../router/handler/serveDirectoryHandler');
const path = require('path');

/**
 * The Bootstrap theme as a subtheme of ThemeBase.
 * @class
 * @extends Defiant.Plugin.ThemeBase
 * @memberOf Defiant.Plugin
 */
class ThemeBootstrap extends ThemeBase {
  /**
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @returns {Defiant.Plugin.ThemeBootstrap}
   *   The plugin that was instantiated.
   */
  constructor(engine) {
    super(engine);

    engine.pluginRegistry.get('Router')
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

    // Add the default Renderables.
    for (let renderable of [
      require('./renderable/page'),
    ]) {
      this.setRenderable(renderable);
    }
  }

  /**
   * Register the Bootstrap CSS and JavaScript with the
   * [Library]{@link Defiant.Library}.
   * @function
   * @async
   */
  async init() {
    this.engine.library.register({
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
    return super.init();
  }
}

module.exports = ThemeBootstrap;
