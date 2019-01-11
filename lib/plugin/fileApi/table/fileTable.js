"use strict";

const Table = require('../../orm/table');
const uuid = require('node-uuid');

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

  async getUrl(entity) {
    if (entity.type) {
      let Orm = this.engine.pluginRegistry.get('Orm');
      let type = Orm.entityRegistry.get(entity.type);
      return (type && type.getUrl) ? type.getUrl(entity) : Promise.resolve('');
    }
  }

  async save(entity) {
    await super.save(entity);
  }

  async prepare(entity) {
    await super.prepare(entity);
    entity.uuid = entity.uuid || uuid.v4();
    entity.revisionId = entity.revisionId || null;
    entity.created = entity.created ? entity.created : Date.now();
  }

  async load(entity) {
    await super.load(entity);
    return entity;
  }

  async purge(condition) {
    condition = Number.isInteger(condition) ? {id: condition} : condition;
    await super.purge(condition);
  }
}

module.exports = FileEntity;
