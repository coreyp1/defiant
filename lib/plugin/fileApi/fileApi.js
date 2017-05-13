"use strict";

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const FileEntity = require('../fileApi/entity/fileEntity');

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
    let fileEntity = new FileEntity(engine, 'file', {});
    engine.plugin.get('Orm').entity.set(fileEntity);
  }
}

module.exports = FileApi;
