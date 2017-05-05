"use strict";

const Plugin = require('../../plugin');
const ServeDirectoryHandler = require('../../plugin/router/handler/serveDirectoryHandler');
const path = require('path');

class Materialize extends Plugin {
  constructor(engine) {
    super(engine);
    engine.plugin.get('Router')
      .addHandler(new ServeDirectoryHandler({
        id: 'Library.Materialize.DirectoryHandler',
        path: 'file/library/materialize',
        target: path.join(path.dirname(require.resolve('materialize-css')), '..', 'dist'),
        menu: undefined,
        fileOptions: {},
        directoryOptions: undefined,
      }));

    engine.library.register({
      id: 'Materialize',
      css: [{
        id: 'materialize',
        url: '/file/library/materialize/css/materialize.min.css',
      }],
      jsFooter: [{
        id: 'materialize',
        url: '/file/library/materialize/js/materialize.min.js',
      }],
    });
  }
}

module.exports = Materialize;
