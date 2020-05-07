"use strict";

const Plugin = require('../../plugin');
const ServeDirectoryHandler = require('../../plugin/router/handler/serveDirectoryHandler');
const path = require('path');

/**
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Library
 */
class JQuery extends Plugin {
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
              id: 'jQuery',
              jsFooter: [{
                id: 'jQuery',
                url: '/file/library/jQuery/jquery.min.js',
              },
              {
                id: 'jQuery.noConflict',
                url: '/file/library/jQueryShim/jQueryNoConflict.js',
                path: path.join(__dirname, '../file/jQueryNoConflict.js')
              }],
            });
            break; // Library

          case 'Router':
            plugin
              .addHandler(new ServeDirectoryHandler({
                id: 'Library.JQuery.DirectoryHandler',
                path: 'file/library/jQueryShim',
                target: path.join(__dirname, 'file'),
                menu: undefined,
                fileOptions: {},
                directoryOptions: undefined,
              }))
              .addHandler(new ServeDirectoryHandler({
                id: 'Library.JQuery.JQueryHandler',
                path: 'file/library/jQuery',
                target: path.dirname(require.resolve('jquery')),
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

module.exports = JQuery;
