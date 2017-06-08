"use strict";

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const FileTable = require('../fileApi/table/fileTable');

class FileApi extends Plugin {
  constructor(engine) {
    super(engine);

    // Set up the File Manager Registry.
    this.manager = new Registry();
    this.manager.set(new (require('./manager/localManager'))(engine, 'defaultLocalManager', {
      path: 'file/manager/local',
      targetDirectory: '/var/defiant/file/local',
    }));

    // Declare a File Entity.
    let fileTable = new FileTable(engine, 'file', {});
    engine.pluginRegistry.get('Orm').entity.set(fileTable);
  }
}

module.exports = FileApi;
