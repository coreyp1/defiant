"use strict";

const Plugin = require('../plugin');
const ServeDirectoryHandler = require('../router/handler/serveDirectoryHandler');
const path = require('path');

class Example extends Plugin {
  constructor(engine) {
    super(engine);
    engine.plugin.get('Router')
      .addHandler(new (require('./handler/textHandler'))())
      .addHandler(new (require('./handler/jsonHandler'))())
      .addHandler(new (require('./handler/themedHandler'))())
      .addHandler(new (require('./handler/fapiHandler'))())
      .addHandler(new (require('./handler/frontPageHandler'))())
      .addHandler(new ServeDirectoryHandler({
        id: 'Example.DirectoryHandler',
        path: 'example.directory',
        target: path.join(__dirname, 'file'),
        menu: undefined,
        fileOptions: {},
        directoryOptions: {},
      }))
      .addHandler(new (require('./handler/adminHandler'))())
      .addHandler(new (require('./handler/alwaysProcessHandler'))());
    engine.plugin.get('Fapi')
      .setForm(require('./form/exampleForm'));
  }
}

module.exports = Example;
