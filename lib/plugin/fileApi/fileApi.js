"use strict";

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const FileTable = require('../fileApi/table/fileTable');

/**
 * The FileApi is a manager to handle file uploads.  When a file is uploaded, it
 * must be put *somewhere*, either locally or transferred to another server.
 * The FileApi plugin allows other plugins to provide custom handling of
 * uploaded files.
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Plugin
 */
class FileApi extends Plugin {
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
        // Set up the File Manager Registry.
        /**
        * @member {Defiant.util.Registry} Defiant.Plugin.FileApi#fileManagerRegistry
        *   A registry of available file
        *   [Managers]{@link Defiant.Plugin.FileApi.Manager}.
        */
        this.fileManagerRegistry = new Registry();
        this.fileManagerRegistry.set(new (require('./manager/localManager'))(this.engine, 'defaultLocalManager', {
          path: 'file/manager/local',
          targetDirectory: '/var/defiant/file/local',
        }));

        for (let existingPlugin of ['Orm'].map(name => this.engine.pluginRegistry.get(name))) {
          if (existingPlugin instanceof Plugin) {
            await this.notify(existingPlugin, 'enable');
          }
        }
        break; // pre:enable

      case 'enable':
        switch ((plugin || {}).id) {
          case 'Orm':
            // Declare a File Entity.
            let fileTable = new FileTable(this.engine, 'file', {});
            plugin.entityRegistry.set(fileTable);
            break; // Router
        }
        break; // enable

      case 'pre:disable':
        // @todo Cleanup entries in Orm.
        break; // pre:disable
    }
  }
}

module.exports = FileApi;
