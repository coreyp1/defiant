"use strict";

const Plugin = require('../plugin');
const Form = require('../formApi/form');
const Data = require('../settings/data');
const LayoutRenderable = require('./layout/layoutRenderable');
const InitRegistry = require('../../util/initRegistry');
const ServeDirectoryHandler = require('../router/handler/serveDirectoryHandler');
const path = require('path');

/**
 * The Layout plugin provides a
 * [Widget]{@link Defiant.Plugin.Layout.Widget}-based system for controlling the
 * design and layout of a [Themed]{@link Defiant.Plugin.Http.Themed} request
 * response.
 *
 * Plugins provide Widgets by declaring them to the Layout module using the
 * [widgetRegistry]{@link Defiant.Plugin.Layout#widgetRegistry}.
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Plugin
 */
class Layout extends Plugin {
  constructor(engine) {
    super(engine);

    // Create the Layouts Registry.
    /**
     * @member {Defiant.util.InitRegistry} Defiant.Plugin.Layout#layoutRegistry
     *   A collection of Layouts which can be customized.
     */
    this.layoutRegistry = new InitRegistry({}, [engine]);
    this.layoutRegistry.set(new LayoutRenderable(engine, {
      id: 'defaultLayout',
      templateContents: `<nav>
        <div class="nav-wrapper">
          <%= navigation %>
        </div>
      </nav>
      <div class="row">
        <div class="col s12">
          <%= content %>
        </div>
      </div>
      <div class="divider"></div>
      <div class="row">
        <footer class="col s12">
          <%= footer %>
        </footer>
      </div>`,
      variables: ['navigation', 'content', 'footer'],
      paths: [''],
      regions: {
        navigation: [
          'Layout.SiteNameWidget',
          'Menu.default',
        ],
        content: [
          'Layout.TitleWidget',
          'Message.MessageWidget',
          'Layout.ContentWidget',
        ],
        footer: [
          'Menu.admin',
        ],
      },
    }));

    // Create the Widgets Registry.
    /**
     * @member {Defiant.util.InitRegistry} Defiant.Plugin.Layout#widgetRegistry
     *   Registry that holds Widgets that may be included in Layouts.
     */
    this.widgetRegistry = new InitRegistry({}, [engine]);
    this.widgetRegistry.set(require('./widget/contentWidget'))
      .set(require('./widget/siteNameWidget'))
      .set(require('./widget/titleWidget'));

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

    // Register Form element
    const WidgetPlacement = new (require('./renderable/widgetPlacementRenderable.js'))(engine);
    engine.pluginRegistry.get('FormApi')
      .setElement(WidgetPlacement);
    engine.pluginRegistry.get('ThemeBase')
      .setRenderable(WidgetPlacement);
  }

  /**
   * All plugins will be initialized in order of their weight by
   * {@link Defiant.Engine#init}.
   * @function
   * @async
   */
  async init() {
    await super.init();
    // Add the Form Handlers.
    this.engine.pluginRegistry.get('FormApi')
      .setForm(new Form(this.engine, {
        id: 'LayoutEditForm',
        Instance: require('./form/layoutEditFormInstance'),
      }));

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
