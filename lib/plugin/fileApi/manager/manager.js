"use strict";

const Table = require('../../orm/table');

class Manager extends Table {
  constructor(engine, name, options) {
    super(engine, name);
    this.options = options;
  }

  schema() {
    let schema = super.schema();
    schema.columns.push({
      name: 'fileId',
      dataType: 'INTEGER',
      notNull: true,
      unique: false, // Not 'true' to avoid autoincrement connotation.
    });
    schema.keys.push('fileId');
    return schema;
  }

  getUrl(entity) {
    return entity.tempPath;
  }

  save(entity) {
    return co(function*(self, superSave) {
      entity.managerData = entity.managerData || {};
      yield superSave.call(self, entity.managerData);
    })(this, super.save);
  }

  load(entity) {
    return co(function*(self, superLoad) {
      entity.managerData = {
        fileId: entity.id,
        manager: self.name,
      };
      yield superLoad.call(self, entity.managerData);
    })(this, super.load);
  }

  purge(entityId) {
    return co(function*(self, superPurge) {
      yield superPurge.call(self, entityId);
    })(this, super.purge);
  }
}

module.exports = Manager;
