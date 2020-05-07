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

/**
 * This Plugin serves as as a set of examples of how to interact with the
 * Defiant API.
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Plugin
 */
class Example extends Plugin {
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
        for (let existingPlugin of ['Settings', 'FormApi', 'Router'].map(name => this.engine.pluginRegistry.get(name))) {
          if (existingPlugin instanceof Plugin) {
            await this.notify(existingPlugin, 'enable');
          }
        }
        break; // pre:enable

      case 'enable':
        switch ((plugin || {}).id) {
          case 'Orm':
            // Register the Tables.
            plugin.entityRegistry.set(new ExampleFileUploadTable(this.engine, 'exampleFileUpload'));
            break; // Orm

          case 'ThemeBase':
            // Register Theme elements.
            plugin
            .setRenderable(new Renderable(this.engine, {
              id: 'FileUploadListRenderable',
              templateFile: __dirname + '/html/FileUploadListRenderable.html',
              variables: ['files'],
            }));
            break; // ThemeBase

          case 'FormApi':
            // Register the forms.
            plugin
              .setForm(new Form(this.engine, {
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
              .setForm(new Form(this.engine, {
                id: 'ExampleFileUploadForm',
                Instance: require('./form/exampleFileUploadFormInstance'),
              }));

            this.FormApi_Router_enabled();
            break; // FormApi

          case 'Router':
            // Register handlers.
            plugin
              .addHandler(new (require('./handler/textHandler'))())
              .addHandler(new (require('./handler/jsonHandler'))())
              .addHandler(new (require('./handler/themedHandler'))())
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

            this.FormApi_Router_enabled();
            break; // Router

          case this.id:
            break; // this.id
        }
        break; // enable

      case 'pre:disable':
        // @todo Cleanup entries in Settings, FormApi, Router.
        break; // pre:disable
    }
  }

  /**
   * Add the necessary handlers when both FormApi and Router plugins have
   * already been enabled.
   * @todo Prevent this from adding the Handlers multiple times.
   * @function
   */
  FormApi_Router_enabled() {
    const FormApi = this.engine.pluginRegistry.get('FormApi');
    const Router = this.engine.pluginRegistry.get('Router');

    if ((FormApi instanceof Plugin) && (Router instanceof Plugin)) {
      // Register handlers.
      Router
        .addHandler(new Handler({
          id: 'Example.FormApiHandler',
          path: 'example.formApi',
          menu: {
            menu: 'default',
            text: 'FormApi Example',
            description: 'Demonstrate the Form API',
          },
          renderable:FormApi.getForm('ExampleForm'),
        }))
        .addHandler(new AdminHandler({
          id: 'Example.FileUploadHandler',
          path: 'admin/exampleFileUpload',
          menu: {
            menu: 'admin',
            text: 'Example File Upload',
            description: 'Demonstrates FormApi and FileApi integration',
          },
          renderable: FormApi.getForm('ExampleFileUploadForm'),
        }));
    }
  }
}

module.exports = Example;
