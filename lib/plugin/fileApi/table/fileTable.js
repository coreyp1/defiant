"use strict";

const Table = require('../../orm/table');
const uuid = require('node-uuid');
const {coroutine: co} = require('bluebird');

class FileEntity extends Table {
  constructor(engine, name, options) {
    super(engine, name);
    this.options = options;
    return this;
  }

  schema() {
    let schema = super.schema();
    schema.columns.push({
      name: 'uuid',
      dataType: 'VARCHAR(36)',
      notNull: true,
      unique: true,
    }, {
      name: 'type',
      dataType: 'TEXT',
      notNull: false,
      unique: false,
    }, {
      name: 'created',
      dataType: 'INTEGER',
      notNull: true,
      unique: false,
    }, {
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
      name: 'usageCount',
      dataType: 'INTEGER',
      notNull: true,
      unique: false,
    }, {
      name: 'path',
      dataType: 'TEXT',
      notNull: true,
      unique: false,
    });
    schema.keys.push('uuid', 'accountId', 'type');
    return schema;
  }

  getUrl(entity) {
    if (entity.type) {
      let Orm = this.engine.pluginRegistry.get('Orm');
      let type = Orm.entityRegistry.get(entity.type);
      return (type && type.getUrl) ? type.getUrl(entity) : Promise.resolve('');
    }
    return Promise.resolve('');
  }

  save(entity) {
    return co(function*(self, superSave) {
      yield superSave.call(self, entity);
    })(this, super.save);
  }

  prepare(entity) {
    return co(function*(self, superPrepare) {
      yield superPrepare.call(self, entity);
      entity.uuid = entity.uuid || uuid.v4();
      entity.revisionId = entity.revisionId || null;
      entity.created = entity.created ? entity.created : Date.now();
    })(this, super.prepare);
  }

  load(entity) {
    return co(function*(self, superLoad) {
      yield superLoad.call(self, entity);
      return entity;
    })(this, super.load);
  }

  purge(entityId) {
    return co(function*(self, superPurge) {
      let entity = {id: entityId};
      yield superPurge.call(self, entityId);
    })(this, super.purge);
  }
}

module.exports = FileEntity;
