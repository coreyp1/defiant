"use strict";

const Plugin = require('../plugin');
const Data = require('../settings/data');
const Registry = require('../../util/registry');
const ServeDirectoryHandler = require('../router/handler/serveDirectoryHandler');
const path = require('path');

class Layout extends Plugin {
  constructor(engine) {
    super(engine);

    // Create the Layouts Registry.
    this.layoutRegistry = new Registry();
    this.layoutRegistry.set(new (require('./layout/defaultLayoutRenderable')));

    // Create the Widgets Registry.
    this.widgetRegistry = new Registry();
    this.widgetRegistry.set(new (require('./widget/contentWidget'))())
      .set(new(require('./widget/siteNameWidget'))())
      .set(new(require('./widget/titleWidget'))());

    // Add the layout Handler.
    // TODO: Move to init() and use a separate handler for each path.
    engine.pluginRegistry.get('Router')
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
    engine.pluginRegistry.get('ThemeBase')
      .setRenderable(require('./renderable/widgetPlacementRenderable.js'));
  }

  async init() {
    await super.init();
    // Add the Form Handlers.
    this.engine.pluginRegistry.get('FormApi')
      .setForm(require('./form/layoutEditForm'));

    // Add the Widget Renderables
    this.engine.pluginRegistry.get('ThemeBase')
      .setRenderable(require('./widget'))
      .setRenderable(require('./widget/contentWidget'))
      .setRenderable(require('./widget/siteNameWidget'))
      .setRenderable(require('./widget/titleWidget'));

    // Add layout settings files.
    let Settings = this.engine.pluginRegistry.get('Settings');
    for (let layout of this.layoutRegistry.getIterator()) {
      Settings.cacheRegistry.set(new Data({
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
    this.engine.library.register({
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
  }
}

module.exports = Layout;
