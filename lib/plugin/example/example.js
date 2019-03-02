"use strict";

const Plugin = require('../plugin');
const Form = require('../formApi/form');
const Renderable = require('../theme/renderable');
const ServeDirectoryHandler = require('../router/handler/serveDirectoryHandler');
const FileHandler = require('../router/handler/fileHandler');
const Handler = require('../router/handler/handler');
const AdminHandler = require('../router/handler/adminHandler');
const ExampleFileUploadTable = require('./table/exampleFileUploadTable');
const path = require('path');

class Example extends Plugin {
  constructor(engine) {
    super(engine);

    // Register the forms.
    engine.pluginRegistry.get('FormApi')
      .setForm(new Form(engine, {
        id: 'ExampleForm',
        Instance: require('./form/exampleFormInstance'),
        instanceSetup: {
          data: {
            attributes: {
              id: new Set(['yo']),
              class: new Set(['foo', 'bar', 'baz']),
            },
          },
        },
      }))
      .setForm(new Form(engine, {
        id: 'ExampleFileUploadForm',
        Instance: require('./form/exampleFileUploadFormInstance'),
      }));

    // Register handlers.
    engine.pluginRegistry.get('Router')
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
        renderable: engine.pluginRegistry.get('FormApi').getForm('ExampleForm'),
      }))
      .addHandler(new AdminHandler({
        id: 'Example.FileUploadHandler',
        path: 'admin/exampleFileUpload',
        menu: {
          menu: 'admin',
          text: 'Example File Upload',
          description: 'Demonstrates FormApi and FileApi integration',
        },
        renderable: engine.pluginRegistry.get('FormApi').getForm('ExampleFileUploadForm'),
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
      .addHandler(new (require('./handler/alwaysProcessHandler'))())
      .addHandler(new (require('./handler/serveUploadedFileHandler'))());

    // Register the Tables.
    engine.pluginRegistry.get('Orm').entityRegistry.set(new ExampleFileUploadTable(engine, 'exampleFileUpload'));

    // Register Theme elements.
    engine.pluginRegistry.get('ThemeBase')
      .setRenderable(new Renderable(engine, {
        id: 'FileUploadListRenderable',
        templateFile: __dirname + '/html/FileUploadListRenderable.html',
        variables: ['files'],
      }));
  }
}

module.exports = Example;
