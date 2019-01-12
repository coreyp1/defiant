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

    this.attributeRegistry = new Registry({useId: 'alias'});
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

  async createTable() {
    await super.createTable();
    await this.revisionTable.createTable();

    // Create the attributes' tables.
    for (let attribute of this.attributeRegistry.getOrderedElements()) {
      await attribute.createTable();
    }
  }

  async prepare(entity = {}) {
    await super.prepare(entity);
    entity.uuid = entity.uuid || uuid.v4();
    entity.revisionId = entity.revisionId || null;
  }

  async save(entity) {
    // Get a new revision Id.
    let revision = {entityId: entity.id ? entity.id : null, date: Date.now()};
    await this.revisionTable.save(revision);

    // Add the revision information to the entity and save.
    entity.revisionId = revision.id;
    if (!revision.entityId) {
      // This is a new Entity save.  Set the created field.
      entity.created = revision.date;
    }
    await super.save(entity);

    // Update the revision with the entity.id, if needed.
    if (!revision.entityId) {
      revision.entityId = entity.id;
      await this.revisionTable.save(revision);
    }

    // Save the attributes.
    for (let attribute of this.attributeRegistry.getOrderedElements()) {
      await attribute.save(entity, [attribute.alias]);
    }

    // Finally, clone the entity in order to detect changes later.
    delete entity.oldValue;
    entity.oldValue = clone(entity);

    return entity;
  }

  async load(entity) {
    let result = await super.load(entity);
    if (!result) {
      return null;
    }

    // Load the attributes.
    for (let attribute of this.attributeRegistry.getOrderedElements()) {
      await attribute.load(entity, [attribute.alias]);
    }

    // Finally, clone the entity in order to detect changes later.
    delete entity.oldValue;
    entity.oldValue = clone(entity);

    return entity;
  }

  async purge(entityId) {
    if (!entityId) {
      throw new Error("Entity cannot be purged without an Id.");
    }

    await super.purge({id: entityId});

    // Process attributes.
    for (let attribute of this.attributeRegistry.getOrderedElements()) {
      await attribute.purge([entityId]);
    }
  }
}

module.exports = Entity;
