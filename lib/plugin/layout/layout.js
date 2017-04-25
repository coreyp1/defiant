"use strict";

const Plugin = require('../plugin');
const Data = require('../settings/data');
const Registry = require('../../util/registry');
const ServeDirectoryHandler = require('../router/handler/serveDirectoryHandler');
const path = require('path');
const {coroutine: co, promisify} = require('bluebird');

class Layout extends Plugin {
  constructor(engine) {
    super(engine);

    // Create the Layouts Registry.
    this.layouts = new Registry();
    this.layouts.set(new (require('./layout/defaultLayoutRenderable')));

    // Create the Widgets Registry.
    this.widgets = new Registry();
    this.widgets.set(new (require('./widget/contentWidget'))());

    // Add the layout Handler.
    // TODO: Move to init() and use a separate handler for each path.
    engine.plugin.get('Router')
      .addHandler(new (require('./handler/layoutEditHandler'))())
      .addHandler(new (require('./handler/layoutHandler'))())
      .addHandler(new (require('./handler/layoutListHandler'))())
      .addHandler(new ServeDirectoryHandler({
        id: 'Layout.DirectoryHandler',
        path: 'file/layout',
        target: path.join(__dirname, 'file'),
        menu: undefined,
        fileOptions: {},
        directoryOptions: undefined,
      }));

    // Register Theme elements
    engine.plugin.get('ThemeBase')
      .setRenderable(require('./renderable/widgetPlacementRenderable.js'));
  }

  init() {
    return co(function*(self){
      // Add the Form Handlers.
      self.engine.plugin.get('Fapi')
        .setForm(require('./form/layoutEditForm'));

      // Add the Widget Renderables
      self.engine.plugin.get('ThemeBase')
        .setRenderable(require('./widget'))
        .setRenderable(require('./widget/contentWidget'));

      // Add layout settings files.
      let Settings = self.engine.plugin.get('Settings');
      for (let layout of self.layouts.getIterator()) {
        Settings.cache.set(new Data({
          id: `layout/${layout.id}.json`,
          filename: path.join('layout', `${layout.id}.json`),
          storage: 'settings',
          storageCanChange: true,
          // TODO: Translate.
          // TODO: Escape.
          description: 'Stores the overrides of the layout class, which are set through the administrative interface.',
          default: {
            templateContents: layout.templateContents,
            paths: layout.paths,
            regions: layout.regions,
            variables: layout.variables,
          },
        }));
      }

      // Add Library Entries.
      self.engine.library.register({
        id: 'LayoutWidgetPlacement',
        require: ['jQueryUI'],
        css: [{
          id: 'layoutEdit',
          url: '/file/layout/css/layoutEdit.css',
          path: path.join(__dirname, 'file/css/layoutEdit.css'),
        }],
        jsFooter: [{
          id: 'layoutEdit',
          url: '/file/layout/js/layoutEdit.js',
          path: path.join(__dirname, 'file/js/layoutEdit.js'),
        }],
      });
    })(this);
  }
}

module.exports = Layout;
