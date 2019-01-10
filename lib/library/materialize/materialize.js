"use strict";

const Plugin = require('../../plugin');
const ServeDirectoryHandler = require('../../plugin/router/handler/serveDirectoryHandler');
const path = require('path');

class Materialize extends Plugin {
  constructor(engine) {
    super(engine);
    engine.pluginRegistry.get('Router')
      .addHandler(new ServeDirectoryHandler({
        id: 'Library.Materialize.DirectoryHandler',
        path: 'file/library/materializeShim',
        target: path.join(__dirname, 'file'),
        menu: undefined,
        fileOptions: {},
        directoryOptions: undefined,
      }))
      .addHandler(new ServeDirectoryHandler({
        id: 'Library.Materialize.MaterializeHandler',
        path: 'file/library/materialize',
        target: path.join(path.dirname(require.resolve('materialize-css')), '..'),
        menu: undefined,
        fileOptions: {},
        directoryOptions: undefined,
      }));

    engine.library.register({
      id: 'Materialize',
      require: ['jQuery'],
      css: [{
        id: 'materialize',
        url: '/file/library/materialize/css/materialize.min.css',
      }],
      jsFooter: [{
        id: 'materialize',
        url: '/file/library/materialize/js/materialize.min.js',
      }, {
        id: 'materializeShim',
        url: '/file/library/materializeShim/materializeShim.js',
        path: path.join(__dirname, '../file/materializeShim.js'),
      }],
    });
  }
}

module.exports = Materialize;
