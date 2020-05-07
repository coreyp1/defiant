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
          // Create the Layouts Registry.
          /**
           * @member {Defiant.util.InitRegistry} Defiant.Plugin.Layout#layoutRegistry
           *   A collection of Layouts which can be customized.
           */
          this.layoutRegistry = new InitRegistry({}, [this.engine]);
          this.layoutRegistry.set(new LayoutRenderable(this.engine, {
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
          this.widgetRegistry = new InitRegistry({}, [this.engine]);
          this.widgetRegistry.set(require('./widget/contentWidget'))
            .set(require('./widget/siteNameWidget'))
            .set(require('./widget/titleWidget'));

        for (let existingPlugin of ['FormApi', 'Router', 'ThemeBase', 'Settings', 'Library'].map(name => this.engine.pluginRegistry.get(name))) {
          if (existingPlugin instanceof Plugin) {
            await this.notify(existingPlugin, 'enable');
          }
        }
        break; // pre:enable

      case 'enable':
        switch ((plugin || {}).id) {
          case 'FormApi':
            // Register Form and Elements
            plugin
              .setElement(require('./renderable/widgetPlacementRenderable.js'))
              .setForm(new Form(this.engine, {
                id: 'LayoutEditForm',
                Instance: require('./form/layoutEditFormInstance'),
              }));
            break; // FormApi

          case 'ThemeBase':
            plugin
              .setRenderable(require('./renderable/widgetPlacementRenderable.js'))
              .setRenderable(require('./widget'))
              .setRenderable(require('./widget/contentWidget'))
              .setRenderable(require('./widget/siteNameWidget'))
              .setRenderable(require('./widget/titleWidget'));
            break; // ThemeBase

          case 'Router':
            // Add the layout Handler.
            plugin
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
            break; // Router

          case 'Settings':
            // Add layout settings files.
            for (let layout of this.layoutRegistry.getIterator()) {
              if (!plugin.cacheRegistry.get(`layout/${layout.id}.json`)) {
                plugin.cacheRegistry.set(new Data({
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
            }
            break; // Settings

          case 'Library':
            // Add Library Entries.
            plugin.register({
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
            break; // Library

          case this.id:
            for (let existingPlugin of ['Settings'].map(name => this.engine.pluginRegistry.get(name))) {
              if (existingPlugin instanceof Plugin) {
                await this.notify(existingPlugin, 'enable');
              }
            }
            break; // this.id
        }
        break; // enable

      case 'pre:disable':
        // @todo Cleanup.
        for (let existingPlugin of ['FormApi', 'Router', 'ThemeBase', 'Settings', 'Library'].map(name => this.engine.pluginRegistry.get(name))) {
          if (existingPlugin instanceof Plugin) {
            await this.notify(existingPlugin, 'disable');
          }
        }
        break; // pre:disable

      case 'disable':
        switch ((plugin || {}).id) {
          case this.id:
            break; // this.id
        }
        break; // disable
    }
  }
}

module.exports = Layout;
