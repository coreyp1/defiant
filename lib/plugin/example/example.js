"use strict";

const Plugin = require('../plugin');
const ServeDirectoryHandler = require('../router/handler/serveDirectoryHandler');
const FileHandler = require('../router/handler/fileHandler');
const FileEntity = require('../fileApi/entity/fileEntity');
const Handler = require('../router/handler/handler');
const AdminHandler = require('../router/handler/adminHandler');
const ExampleFileUploadTable = require('./table/exampleFileUploadTable');
const path = require('path');

class Example extends Plugin {
  constructor(engine) {
    super(engine);

    // Register the forms.
    engine.plugin.get('FormApi')
      .setForm(require('./form/exampleForm'))
      .setForm(require('./form/exampleFileUploadForm'));

    // Register handlers.
    engine.plugin.get('Router')
      .addHandler(new (require('./handler/textHandler'))())
      .addHandler(new (require('./handler/jsonHandler'))())
      .addHandler(new (require('./handler/themedHandler'))())
      .addHandler(new Handler({
        id: 'Example.FormApiHandler',
        path: 'example.formApi',
        menu: {
          menu: 'default',
          text: 'FormApi Example',
          description: 'Demonstrate the Form API',
        },
        renderable: engine.plugin.get('FormApi').getForm('ExampleForm'),
      }))
      .addHandler(new AdminHandler({
        id: 'Example.FileUploadHandler',
        path: 'admin/exampleFileUpload',
        menu: {
          menu: 'admin',
          text: 'Example File Upload',
          description: 'Demonstrates FormApi and FileApi integration',
        },
        renderable: engine.plugin.get('FormApi').getForm('ExampleFileUploadForm'),
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
      .addHandler(new FileHandler({
        id: 'Example.FileHandler',
        path: 'example.file/static.txt',
        menu: undefined,
        target: path.join(__dirname, 'file', 'static.txt'),
      }))
      .addHandler(new (require('./handler/adminHandler'))())
      .addHandler(new (require('./handler/alwaysProcessHandler'))());

    engine.plugin.get('Orm').entity.set(new ExampleFileUploadTable(engine, 'exampleFileUpload'));
  }
}

module.exports = Example;
