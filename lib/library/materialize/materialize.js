"use strict";

const Plugin = require('../../plugin');
const ServeDirectoryHandler = require('../../plugin/router/handler/serveDirectoryHandler');
const path = require('path');

/**
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Library
 */
class Materialize extends Plugin {
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
              id: 'Materialize',
              require: ['jQuery'],
              css: [{
                id: 'materialize',
                url: '/file/library/materialize/css/materialize.min.css',
              }],
              jsFooter: [{
                id: 'materialize',
                url: '/file/library/materialize/js/materialize.min.js',
              },
              {
                id: 'materializeShim',
                url: '/file/library/materializeShim/materializeShim.js',
                path: path.join(__dirname, 'file/materializeShim.js'),
              }],
            });
            break; // Library

          case 'Router':
            plugin
            .addHandler(new ServeDirectoryHandler({
              id: 'Library.Materialize.DirectoryHandler',
              path: 'file/library/materializeShim',
              target: path.join(__dirname, 'file'),
              menu: undefined,
              fileOptions: {},
              directoryOptions: undefined,
            }))
            .addHandler(new ServeDirectoryHandler({
              id: 'Library.Materialize.MaterializeHandler',
              path: 'file/library/materialize',
              target: path.join(path.dirname(require.resolve('materialize-css')), '..'),
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

module.exports = Materialize;
