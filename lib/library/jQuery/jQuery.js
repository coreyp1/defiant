"use strict";

const Plugin = require('../../plugin');
const ServeDirectoryHandler = require('../../plugin/router/handler/serveDirectoryHandler');
const path = require('path');

/**
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Library
 */
class JQuery extends Plugin {
  /**
   * @constructor
   * @param {Defiant.Engine} engine The app engine.
   */
  constructor(engine){
    super(engine);
    engine.pluginRegistry.get('Router')
      .addHandler(new ServeDirectoryHandler({
        id: 'Library.JQuery.DirectoryHandler',
        path: 'file/library/jQueryShim',
        target: path.join(__dirname, 'file'),
        menu: undefined,
        fileOptions: {},
        directoryOptions: undefined,
      }))
      .addHandler(new ServeDirectoryHandler({
        id: 'Library.JQuery.JQueryHandler',
        path: 'file/library/jQuery',
        target: path.dirname(require.resolve('jquery')),
        menu: undefined,
        fileOptions: {},
        directoryOptions: undefined,
      }));

    engine.library.register({
      id: 'jQuery',
      jsFooter: [{
        id: 'jQuery',
        url: '/file/library/jQuery/jquery.min.js',
      },
      {
        id: 'jQuery.noConflict',
        url: '/file/library/jQueryShim/jQueryNoConflict.js',
        path: path.join(__dirname, '../file/jQueryNoConflict.js')
      }],
    });
  }
}

module.exports = JQuery;
