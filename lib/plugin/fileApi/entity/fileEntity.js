"use strict";

const Entity = require('../../orm/entity');
const {coroutine: co} = require('bluebird');

class FileEntity extends Entity {
  constructor(engine, name, options) {
    super(engine, name);
    this.options = options;
    return this;
  }

  schema() {
    let schema = super.schema();
    schema.columns.push({
      name: 'accountId',
      dataType: 'INTEGER',
      notNull: false,
      unique: false,
    }, {
      name: 'size',
      dataType: 'INTEGER',
      notNull: false,
      unique: false,
    }, {
      name: 'originalName',
      dataType: 'TEXT',
      notNull: false,
      unique: false,
    }, {
      name: 'manager',
      dataType: 'TEXT',
      notNull: false,
      unique: false,
    }, {
      name: 'migrateManager',
      dataType: 'TEXT',
      notNull: false,
      unique: false,
    }, {
      name: 'usageCount',
      dataType: 'INTEGER',
      notNull: true,
      unique: false,
    }, {
      name: 'tempPath',
      dataType: 'TEXT',
      notNull: true,
      unique: false,
    });
    schema.keys.push('manager', 'migrateManager', 'accountId');
    return schema;
  }

  getUrl(entity) {
    if (entity.Manager) {
      return entity.Manager.getUrl(entity);
    }
    return Promise.resolve('');
  }

  save(entity) {
    return co(function*(self, superSave) {
      yield superSave.call(self, entity);
      if (self.migrateManager) {
        yield self.migrateManager.save(entity);
      }
    })(this, super.save);
  }

  prepare(entity) {
    return co(function*(self, superPrepare) {
      yield superPrepare.call(self, entity);
      entity.managerData = entity.managerData || {
        fileId: entity.id,
      };
    })(this, super.prepare);
  }

  load(entity) {
    return co(function*(self, superLoad) {
      yield superLoad.call(self, entity);
      // Load the Manager and MigrateManager objects.
      if (entity.manager) {
        entity.Manager = self.engine.plugin.get('FileApi').manager.get(entity.manager);
      }
      if (entity.migrateManager) {
        entity.MigrateManager = self.engine.plugin.get('FileApi').manager.get(entity.migrateManager);
      }
      // Load the data from the appropriate manager.
      if (entity.Manager) {
        yield entity.Manager.load(entity);
      }
      if (!entity.managerData) {
        yield entity.MigrateManager.load(entity);
      }
    })(this, super.load);
  }

  purge(entityId) {
    return co(function*(self, superPurge) {
      let entity = {id: entityId};
      self.load(entity);

      if (entity.Manager && entity.managerData && entity.managerData.id) {
        yield entity.Manager.purge(entity.managerData.id);
      }
      yield superPurge.call(self, entityId);
    })(this, super.purge);
  }
}

module.exports = FileEntity;
