"use strict";

const Plugin = require('../../plugin');
const ServeDirectoryHandler = require('../../plugin/router/handler/serveDirectoryHandler');
const path = require('path');

/**
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Library
 */
class JQueryUI extends Plugin {
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
        for (let existingPlugin of ['Library', 'Router'].map(name => this.engine.pluginRegistry.get(name))) {
          if (existingPlugin instanceof Plugin) {
            await this.notify(existingPlugin, 'enable');
          }
        }
        break; // pre:enable

      case 'enable':
        switch ((plugin || {}).id) {
          case 'Library':
            plugin.register({
              id: 'jQueryUI',
              require: ['jQuery'],
              css: [{
                id: 'jQueryUI',
                url: '/file/library/jQueryUI/jquery-ui.css',
              }],
              jsFooter: [{
                id: 'jQueryUI',
                url: '/file/library/jQueryUI/jquery-ui.min.js',
              }],
            });
            break; // Library

          case 'Router':
            plugin
              .addHandler(new ServeDirectoryHandler({
                id: 'Library.JQueryUI.JQueryUIHandler',
                path: 'file/library/jQueryUI',
                target: path.dirname(require.resolve('jquery-ui-bundle')),
                menu: undefined,
                fileOptions: {},
                directoryOptions: undefined,
              }));
            break; // Router

          case this.id:
            break; // this.id
        }
        break; // enable

      case 'pre:disable':
        // @todo Cleanup entries in Library, Router.
        break; // pre:disable
    }
  }
}

module.exports = JQueryUI;
