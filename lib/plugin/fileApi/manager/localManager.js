"use strict";

const Manager = require('./manager');

class LocalManager extends Manager {
  constructor(engine, name, options) {
    super(engine, name, options);
  }

  schema() {
    let schema = super.schema();
    schema.columns.push({
      name: 'path', // Absolute filepath on the file system.
      dataType: 'TEXT',
      notNull: true,
      unique: false,
    });
    return schema;
  }

  getUrl(entity) {
    // URL in the form of:
    // entity.Manager path / entity.uuid
    return Promise.resolve(entity.managerData ? `${this.path}/${entity.uuid}` : '');
  }
};

module.exports = LocalManager;
