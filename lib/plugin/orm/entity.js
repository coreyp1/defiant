"use strict";

const uuid = require('node-uuid');
const {coroutine: co, promisify} = require('bluebird');
const sql = require('sql');
const Registry = require('../../util/registry');
const Table = require('./table');
const Revision = require('./revision');
const Attribute = require('./attribute');
const clone = require('clone');
sql.setDialect('sqlite');

class Entity extends Table {
  constructor(engine, name, alias = null) {
    super(engine, name, alias);

    this.attributeRegistry = new Registry();
    this.revisionTable = new Revision(engine, this);
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
      name: 'revisionId',
      dataType: 'INTEGER',
      notNull: false,
      unique: false,
    }, {
      name: 'created',
      dataType: 'INTEGER',
      notNull: true,
    });
    schema.keys.push('uuid');
    return schema;
  }

  createTable() {
    return co(function*(self, createTable){
      yield createTable.bind(self)();
      yield self.revisionTable.createTable();

      // Create the attributes' tables.
      for (let attribute of self.attributeRegistry.getOrderedElements()) {
        yield attribute.createTable();
      }
    })(this, super.createTable);
  }

  prepare(entity = {}) {
    return co(function*(self, prepare){
      yield prepare.bind(self)(entity);
      entity.uuid = entity.uuid || uuid.v4();
      entity.revisionId = entity.revisionId || null;
    })(this, super.prepare);
  }

  save(entity) {
    return co(function*(self, save){
      // Get a new revision Id.
      let revision = {entityId: entity.id ? entity.id : null, date: Date.now()};
      yield self.revisionTable.save(revision);

      // Add the revision information to the entity and save.
      entity.revisionId = revision.id;
      if (!revision.entityId) {
        // This is a new Entity save.  Set the created field.
        entity.created = revision.date;
      }
      yield save.bind(self)(entity);

      // Update the revision with the entity.id, if needed.
      if (!revision.entityId) {
        revision.entityId = entity.id;
        yield self.revisionTable.save(revision);
      }

      // Save the attributes.
      for (let attribute of self.attributeRegistry.getOrderedElements()) {
        yield attribute.save(entity, [attribute.id]);
      }

      // Finally, clone the entity in order to detect changes later.
      delete entity.oldValue;
      entity.oldValue = clone(entity);

      return entity;
    })(this, super.save);
  }

  load(entity) {
    return co(function*(self, load){
      let result = yield load.bind(self)(entity);
      if (!result) {
        return null;
      }

      // Load the attributes.
      for (let attribute of self.attributeRegistry.getOrderedElements()) {
        yield attribute.load(entity, [attribute.id]);
      }

      // Finally, clone the entity in order to detect changes later.
      delete entity.oldValue;
      entity.oldValue = clone(entity);

      return entity;
    })(this, super.load);
  }

  purge(entityId) {
    return co(function*(self, purge){
      if (!entityId) {
        throw new Error("Entity cannot be purged without an Id.");
      }

      yield purge.bind(self)({id: entityId});

      // Process attributes.
      for (let attribute of self.attributeRegistry.getOrderedElements()) {
        yield attribute.purge([entityId]);
      }
    })(this, super.purge);
  }
}

module.exports = Entity;
