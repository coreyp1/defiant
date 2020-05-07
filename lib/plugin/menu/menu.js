"use strict";

const Plugin = require('../plugin');
const Data = require('../settings/data');
const MenuWidget = require('./widget/menuWidget');
const Handler = require('../router/handler');
const merge = require('../../util/merge');
const Path = require('path');

/**
 * @typedef Defiant.Plugin.Menu.HandlerMenu
 * @prop {String} menu The menu that this Handler should be included in by
 *   default.
 * @prop {String} text The text of the menu link.
 * @prop {String} description The description of this menu link (for
 *   Administration purposes).
 */

/**
 * The Menu Plugin provides visual, constextual menus for display to the user.
 * @class
 * @extends Defiant.Plugin
 * @memberof Defiant.Plugin
 */
class Menu extends Plugin {
  /**
   * Process a notification that some `plugin` has performed some `action`.
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
        /**
         * @member {Map<String,Defiant.Plugin.Menu.MenuWidget>} Defiant.Plugin.Menu#menus
         *   Settings for the existing menus.
         */
        this.menus = {};

        /**
         * @member {Defiant.Plugin.Router.Handler[]} Defiant.Plugin.Menu#handlerQueue
         *   Queue for holding Handlers that will be processed once the Menu Plugin
         *   is fully loaded.
         */
        this.handlerQueue = [];

        for (let existingPlugin of ['Settings', 'Layout', 'ThemeBase'].map(name => this.engine.pluginRegistry.get(name))) {
          if (existingPlugin instanceof Plugin) {
            await this.notify(existingPlugin, 'enable');
          }
        }
        break; // 'pre-enable'

      case 'enable':
        switch ((plugin || {}).id) {
          case 'Settings':
            let test = plugin.cacheRegistry.get('menu/menus.json');

            if (!test) {
              // Declare the Default menus
              plugin.cacheRegistry.set(new Data({
                id: `menu/menus.json`,
                filename: Path.join('menu', `menus.json`),
                storage: 'settings',
                storageCanChange: true,
                // TODO: Escape.
                description: 'Stores the list of Menus.',
                default: [
                  'default',
                  'admin',
                  'context',
                  'navigation',
                ],
              }));

              // Declare the menu overrides.
              plugin.cacheRegistry.set(new Data({
                id: `menu/entryOverrides.json`,
                filename: Path.join('menu', `entryOverrides.json`),
                storage: 'settings',
                storageCanChange: true,
                // TODO: Escape.
                description: 'Stores the menu entry overrides.',
                default: {},
              }));

              const menus = await plugin.cacheRegistry.get('menu/menus.json').load();
              // TODO: Translate.
              // TODO: Escape.
              const defaults = {
                default: {
                  title: 'Menu',
                  description: 'Default menu that most likely appear in the sidebar of each page.',
                  showParentLinks: true,
                  maxLevels: undefined,
                  instanceSetup: {
                    data: {
                      attributes: {
                        class: ['right'],
                      },
                    },
                  },
                },
                admin: {
                  title: 'Admin Menu',
                  description: 'Administration menu.',
                  showParentLinks: true,
                  maxLevels: undefined,
                },
                context: {
                  title: 'Context Sensitive Menu',
                  description: 'Menu whose items contain dynamic paths.',
                  showParentLinks: false,
                  maxLevels: 1,
                },
                navigation: {
                  title: 'Navigation Menu',
                  description: 'Small menu whose items are normally used for site navigation.',
                  showParentLinks: false,
                  maxLevels: 1,
                  instanceSetup: {
                    data: {
                      attributes: {
                        class: ['right'],
                      },
                    },
                  },
                },
              };
              for (let menu of menus) {
                // TODO: Escape.
                plugin.cacheRegistry.set(new Data({
                  id: `menu/menu-${menu}.json`,
                  // TODO: SECURITY! Escape file name!
                  filename: Path.join('menu', `menu-${menu}.json`),
                  storage: 'settings',
                  storageCanChange: true,
                  // TODO: Escape.
                  description: 'Stores the settings for a menu.',
                  default: merge({
                    id: `Menu.${menu}`,
                    title: menu,
                    description: '',
                    showParentLinks: true,
                    maxLevels: undefined,
                    overrides: {},
                    displayTitle: false,
                  }, (defaults[menu] ? defaults[menu] : {})),
                }));
              }

              // Load the Menu Entry overrides.
              /**
               * @member {Defiant.Plugin.Settings.Data} Defiant.Plugin.Menu#entryOverrides
               *   The overrides for the menu entries.
               */
              this.entryOverrides = await plugin.cacheRegistry.get('menu/entryOverrides.json').load();

              this.processHandlers();

              await this.enableSettingsAndLayout();
            }
            break; // Settings

          case 'Layout':
            await this.enableSettingsAndLayout();
            break; // Layout

          case 'ThemeBase':
            // Register Theme elements
            plugin
              .setRenderable(require('./widget/menuWidget.js'));
            break; // ThemeBase

          case this.id:
            // Process any handlers that have been queued.
            this.processHandlers();
            break; // this.id
        }
        break; // 'enable'

      case 'pre:disable':
        // @todo: Remove Data from Settings plugin.
        break; // pre:disable
    }
  }

  /**
   * Perform additional setup that requires both Settings and Layout to be
   * enabled.
   * @function
   * @async
   */
  async enableSettingsAndLayout() {
    const Settings = this.engine.pluginRegistry.get('Settings');
    const Layout = this.engine.pluginRegistry.get('Layout');

    if ((Layout instanceof Plugin) && (Settings instanceof Plugin)) {
      // Load the menus and create a Widget for each of them.
      // TODO: Translate.
      const menus = await Settings.cacheRegistry.get('menu/menus.json').load();
      for (let menu of (menus || [])) {
        if (!this.menus[menu]) {
          let settings = await Settings.cacheRegistry.get(`menu/menu-${menu}.json`).load();
          if (settings.instanceSetup && settings.instanceSetup.data && settings.instanceSetup.data.attributes && settings.instanceSetup.data.attributes.id) {
            settings.instanceSetup.data.attributes.id = new Set(settings.instanceSetup.data.attributes.id);
          }
          if (settings.instanceSetup && settings.instanceSetup.data && settings.instanceSetup.data.attributes && settings.instanceSetup.data.attributes.class) {
            settings.instanceSetup.data.attributes.class = new Set(settings.instanceSetup.data.attributes.class);
          }
          this.menus[menu] = new MenuWidget(this.engine, settings);
        }
        if (!Layout.widgetRegistry.get(this.menus[menu].id)) {
          Layout.widgetRegistry.set(this.menus[menu]);
        }
      }
    }
  }

  /**
   * Inform the Menu plugin about a Handler.
   * @function
   * @param {Defiant.Plugin.Router.Handler} handler
   *   The Handler to be added to a Menu.
   * @returns {Defiant.Plugin.Menu}
   *   The instantiated Menu plugin.
   */
  addHandler(handler) {
    this.handlerQueue.push(handler);
    this.processHandlers();
    return this;
  }

  /**
   * Process the queued Handlers, once the overrides have been loaded.
   *
   * Overrides are stored via a [Data]{@link Defiant.Plugin.Settings.Data}
   * object, and as such they cannot be processed until the
   * {Defiant.Plugin.Settings}[Settings] plugin is loaded.
   * @function
   * @async
   */
  processHandlers() {
    if (this.entryOverrides !== undefined) {
      for (let key in this.handlerQueue) {
        let handler = this.handlerQueue[key];
        if (handler instanceof Handler) {
          if (this.entryOverrides[handler.id]) {
            // There is an override for this handler.
          }
          else {
            // There is no override for this handler.
            if (handler.menu && handler.menu.menu && this.menus[handler.menu.menu]) {
              // The menu exists.
              // Add the handler.
              this.menus[handler.menu.menu].addHandler(handler);
            }
          }
        }
        else {
          // This is an ad-hoc menu entry.
        }
      }
      // Clear the queue.
      this.handlerQueue = [];
    }
  }
}

module.exports = Menu;
