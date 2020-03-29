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
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @returns {Defiant.Plugin}
   *   The plugin that was instantiated.
   */
  constructor(engine) {
    super(engine);

    // Set up the File Manager Registry.
    /**
     * @member {Defiant.util.Registry} Defiant.Plugin.FileApi#fileManagerRegistry
     *   A registry of available file
     *   [Managers]{@link Defiant.Plugin.FileApi.Manager}.
     */
    this.fileManagerRegistry = new Registry();
    this.fileManagerRegistry.set(new (require('./manager/localManager'))(engine, 'defaultLocalManager', {
      path: 'file/manager/local',
      targetDirectory: '/var/defiant/file/local',
    }));

    // Declare a File Entity.
    let fileTable = new FileTable(engine, 'file', {});
    engine.pluginRegistry.get('Orm').entityRegistry.set(fileTable);
  }
}

module.exports = FileApi;
