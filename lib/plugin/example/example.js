"use strict";

const Plugin = require('../plugin');
const ServeDirectoryHandler = require('../router/handler/serveDirectoryHandler');
const Handler = require('../router/handler/handler');
const path = require('path');

class Example extends Plugin {
  constructor(engine) {
    super(engine);

    // Register the forms.
    engine.plugin.get('Fapi')
      .setForm(require('./form/exampleForm'));

    // Register handlers.
    engine.plugin.get('Router')
      .addHandler(new (require('./handler/textHandler'))())
      .addHandler(new (require('./handler/jsonHandler'))())
      .addHandler(new (require('./handler/themedHandler'))())
      .addHandler(new Handler({
        id: 'Example.FapiHandler',
        path: 'example.fapi',
        menu: {
          menu: 'default',
          text: 'FAPI Example',
          description: 'Demonstrate the Form API',
        },
        renderable: engine.plugin.get('Fapi').getForm('ExampleForm'),
      }))
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
  }
}

module.exports = Example;
