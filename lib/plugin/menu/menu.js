"use strict";

const Plugin = require('../plugin');
const Data = require('../settings/data');
const MenuWidget = require('./widget/menuWidget');
const Handler = require('../router/handler');
const merge = require('../../util/merge');
const Path = require('path');
const {coroutine: co} = require('bluebird');

class Menu extends Plugin {
  constructor(engine) {
    super(engine);

    // Declare the Default menus
    let Settings = engine.pluginRegistry.get('Settings');
    Settings.cacheRegistry.set(new Data({
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
    Settings.cacheRegistry.set(new Data({
      id: `menu/entryOverrides.json`,
      filename: Path.join('menu', `entryOverrides.json`),
      storage: 'settings',
      storageCanChange: true,
      // TODO: Escape.
      description: 'Stores the menu entry overrides.',
      default: {},
    }));

    this.menus = {};
    this.handlerQueue = [];
  }

  init() {
    return co(function*(self, superInit){
      yield superInit.call(self);

      // Set up the menu widgets.
      let Settings = self.engine.pluginRegistry.get('Settings');
      let Layout = self.engine.pluginRegistry.get('Layout');
      const menus = yield Settings.cacheRegistry.get('menu/menus.json').load();
      // TODO: Translate.
      // TODO: Escape.
      const defaults = {
        default: {
          title: 'Menu',
          description: 'Default menu that most likely appear in the sidebar of each page.',
          showParentLinks: true,
          maxLevels: undefined,
          attributes: {
            class: ['right'],
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
          attributes: {
            class: ['right'],
          },
        },
      };
      for (let menu of menus) {
        // TODO: Escape.
        Settings.cacheRegistry.set(new Data({
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

      // Load the menus and create a Widget for each of them.
      // TODO: Translate.
      for (let menu of menus) {
        let settings = yield Settings.cacheRegistry.get(`menu/menu-${menu}.json`).load();
        self.menus[menu] = new MenuWidget(settings, self.engine);
        Layout.widgetRegistry.set(self.menus[menu]);
      }

      // Load the Menu Entry overrides.
      self.entryOverrides = yield Settings.cacheRegistry.get('menu/entryOverrides.json').load();
      
      // Process any handlers that have been queued.
      self.processHandlers();

      // Register Theme elements
      self.engine.pluginRegistry.get('ThemeBase')
        .setRenderable(require('./widget/menuWidget.js'));
    })(this, super.init);
  }
  
  addHandler(handler) {
    this.handlerQueue.push(handler);
    if (this.entryOverrides !== undefined) {
      this.processHandlers();
    }
    return this;
  }
  
  processHandlers() {
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

module.exports = Menu;
