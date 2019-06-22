"use strict";

const uuid = require('node-uuid');
const sql = require('sql');
const Registry = require('../../util/registry');
const Table = require('./table');
const Revision = require('./revision');
const Base = require('../queryApi/base');
const Field = require('../queryApi/field');
const UuidField = require('./field/uuidField');
const clone = require('clone');
sql.setDialect('sqlite');

class Entity extends Table {
  constructor(engine, name, data={}) {
    super(engine, name);

    this.name = `e_${name}`;
    this.attributeRegistry = new Registry({useId: 'attributeName'});
    this.revisionTable = new Revision(engine, this);
    this.data = data;
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
      await attribute.save(entity, [attribute.attributeName]);
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
    // TODO: Convert this into a QueryApi call to reduce the number of queries!
    for (let attribute of this.attributeRegistry.getOrderedElements()) {
      await attribute.load(entity, [attribute.attributeName]);
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

  getQueryFields() {
    let fields = super.getQueryFields();
    fields.uuid = new UuidField(this.engine, {
      tableName: this.id,
      fieldName: 'uuid',
    });
    fields.revision = new Field(this.engine, {
      tableName: this.id,
      fieldName: 'revisionId',
    });
    fields.created = new Field(this.engine, {
      tableName: this.id,
      fieldName: 'created',
    });
    return fields;
  }

  getQueryJoins() {
    let joins = super.getQueryJoins();
    let engine = this.engine;
    for (let attribute of this.attributeRegistry.getOrderedElements()) {
      joins[attribute.id] = {
        single: function single(query, joinFromObject, joinToObject) {
          // Get the source table's sql definition.
          let QueryApi = engine.pluginRegistry.get('QueryApi');
          let Orm = engine.pluginRegistry.get('Orm');
          let fromBase = QueryApi.baseRegistry.get(joinFromObject.base);
          let fromBaseTable = Orm.entityRegistry.get(fromBase.data.orm);
          let fromTable = engine.sql.define(fromBaseTable.schema()).as(joinFromObject.baseAlias);

          // Get the target table's sql definition.
          let toBase = QueryApi.baseRegistry.get(joinToObject.base);
          let toBaseTable = Orm.entityRegistry.get(toBase.data.orm);
          let toTable = engine.sql.define(toBaseTable.schema()).as(joinToObject.baseAlias);

          // Add to the query.
          return query
            .leftJoin(toTable)
            .on(fromTable.id.equals(toTable.parentId)
              .and(toTable.revisionIdTo.isNull()));
        },
        multiple: {
          modifyMultipleParent: function modifyMultipleParent(query, fromObject, toObject) {
            // Get the source table's sql definition.
            let QueryApi = engine.pluginRegistry.get('QueryApi');
            let Orm = engine.pluginRegistry.get('Orm');
            let fromBase = QueryApi.baseRegistry.get(fromObject.base);
            let fromBaseTable = Orm.entityRegistry.get(fromBase.data.orm);
            let fromTable = engine.sql.define(fromBaseTable.schema()).as(fromObject.baseAlias);

            // Add to the query.
            return query.select(fromTable.id.as(`__id_${toObject.baseAlias}`));
          },
          addMultipleWhere: function addMultipleWhere(query, fromObject, toObject, parentRows) {
            // Get the target table's sql definition.
            let QueryApi = engine.pluginRegistry.get('QueryApi');
            let Orm = engine.pluginRegistry.get('Orm');
            let toBase = QueryApi.baseRegistry.get(toObject.base);
            let toBaseTable = Orm.entityRegistry.get(toBase.data.orm);
            let toTable = engine.sql.define(toBaseTable.schema()).as(toObject.baseAlias);

            // Compile a list of parent IDs to query for.
            let ids = parentRows
              .map(val => val[`__id_${toObject.baseAlias}`])
              .filter(val => val != undefined);

            // Add to the query.
            return query
              .select(toTable.parentId.as(`__id_${toObject.baseAlias}`))
              .where(toTable.parentId.in(ids).and(toTable.revisionIdTo.isNull()));
          },
          integrateMultiple: function integrateMultiple(fieldName, fromRows, toRows, fromObject, toObject) {
            let joinName = `__id_${toObject.baseAlias}`;

            // Collect the grouped rows.
            let collection = {};
            for (let row of toRows) {
              if (!collection[row[joinName]]) {
                collection[row[joinName]] = []
              }
              collection[row[joinName]].push(row);
            }

            // Distribute the grouped rows to the proper parent.
            for (let row of fromRows) {
              row[fieldName] = collection[row[joinName]] || [];
            }
          },
        },
      };
    }
    return joins;
  }

  getQueryBase() {
    return new Base(this.engine, {
      id: this.id,
      orm: this.id,
      fields: this.getQueryFields(),
      join: this.getQueryJoins(),
    });
  }
}

Entity.path = undefined;

module.exports = Entity;
