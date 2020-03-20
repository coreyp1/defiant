"use strict";

const Plugin = require('../../plugin');
const ServeDirectoryHandler = require('../../plugin/router/handler/serveDirectoryHandler');
const path = require('path');

/**
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Library
 */
class JQueryUI extends Plugin {
  /**
   * @constructor
   * @param {Defiant.Engine} engine The app engine.
   */
  constructor(engine){
    super(engine);
    engine.pluginRegistry.get('Router')
      .addHandler(new ServeDirectoryHandler({
        id: 'Library.JQueryUI.JQueryUIHandler',
        path: 'file/library/jQueryUI',
        target: path.dirname(require.resolve('jquery-ui-bundle')),
        menu: undefined,
        fileOptions: {},
        directoryOptions: undefined,
      }));

    engine.library.register({
      id: 'jQueryUI',
      require: ['jQuery'],
      css: [{
        id: 'jQueryUI',
        url: '/file/library/jQueryUI/jquery-ui.css',
      }],
      jsFooter: [{
        id: 'jQueryUI',
        url: '/file/library/jQueryUI/jquery-ui.min.js',
      }],
    });
  }
}

module.exports = JQueryUI;
