"use strict";

const sql = require('sql');
const Table = require('../table');
const Registry = require('../../../util/registry');
const {coroutine: co, promisify} = require('bluebird');

class Attribute extends Table {
  constructor(engine, relationship, name, alias=null) {
    super(engine, relationship.name + '_' + name, name);
    this.relationship = relationship;
    this.attributeRegistry = new Registry();
    engine.pluginRegistry.get('Orm').entityRegistry.set(this);
    return this;
  }

  schema() {
    let schema = super.schema();
    schema.columns.push({
      name: 'parentId',
      dataType: 'INTEGER',
      notNull: true,
    }, {
      name: 'revisionIdFrom',
      dataType: 'INTEGER',
      notNull: true,
    }, {
      name: 'revisionIdTo',
      dataType: 'INTEGER',
      notNull: false,
    }, {
      name: 'weight',
      dataType: 'REAL',
      notNull: true,
    });
    schema.keys.push('parentId, revisionIdTo, revisionIdFrom');
    return schema;
  }

  createTable() {
    return co(function*(self, createTable){
      yield createTable.bind(self)();

      // Create any sub-attributes' tables.
      for (let attribute of self.attributeRegistry.getOrderedElements()) {
        yield attribute.createTable();
      }
    })(this, super.createTable);
  }

  prepare(entity, path) {
    return co(function*(self, prepare){
      if (!path) {
        // The function was called from the Table.save() function.
        // The prepare() has already been run, so we can safely return.
        return;
      }
      let values = self.drilldown(entity, path);
      for (let i in values) {
        let value = values[i];
        yield prepare.bind(self)(value);

        // Set defaults (if needed).
        let relationship = self.drilldown(entity, path.slice(0, -1));
        value.parentId = relationship.id;
        value.revisionIdFrom = value.revisionIdFrom || 0;
        value.revisionIdTo = value.revisionIdTo || null;
        value.weight = value.weight || 0;
      }
    })(this, super.prepare);
  }

  save(entity, path) {
    return co(function*(self, save){
      let newValue = self.drilldown(entity, path);
      let oldValue = self.drilldown(entity.oldValue || {}, path);

      // Call our version of the prepare function.
      yield self.prepare(entity, path);

      // First, "remove" any old values that are no longer present.
      // Create a map of the existing attribute ids in order to quickly
      // determine which elements from oldValue are no longer present.
      // Do this removal first, because subsequent steps may change the ids.
      let mapping = {};
      for (let key in newValue) {
        mapping[newValue[key].id] = key;
      }
      for (let i in oldValue) {
        let newValueIndex = mapping[oldValue[i].id];
        if (newValueIndex === undefined) {
          // The oldValue[i] must be "removed" from the record.
          // Set the revisionIdTo of the current record to entity.revisionId.
          let table = sql.define(self.getSchema());
          let query = table.update({revisionIdTo: entity.revisionId}).where(table.id.equals(oldValue[i].id));
          let stmt = self.engine.database.prepare(query.text);
          let run = promisify(stmt.run, {context: stmt});
          let finalize = promisify(stmt.finalize, {context:stmt});
          yield run(query.values);
          yield finalize();
        }
        else {
          // Update the entry (if necessary).
          // If there has been a change, update the revision columns.

          // TODO: Don't save if only the weights change but the order is the same.
          if (yield self.valuesHaveChanged(oldValue[i], newValue[newValueIndex])) {
            // Set the revisionIdTo of the current record to entity.revisionId.
            let table = sql.define(self.schema());
            let query = table.update({revisionIdTo: entity.revisionId}).where(table.id.equals(oldValue[i].id)).toQuery();
            let stmt = self.engine.database.prepare(query.text);
            let run = promisify(stmt.run, {context: stmt});
            let finalize = promisify(stmt.finalize, {context:stmt});
            yield run(query.values);
            yield finalize();

            // Add a new record for this revision.
            delete newValue[newValueIndex].id;
            newValue[newValueIndex].revisionIdFrom = entity.revisionId;
            newValue[newValueIndex].revisionIdTo = null;
            yield save.bind(self)(self.drilldown(entity, path.concat([i])));
          }

          // Now process any sub-attributes.
          for (let attribute of self.attributeRegistry.getOrderedElements()) {
            yield attribute.save(entity, path.concat([i, attribute.id]));
          }
        }

      }

      for (let i in newValue) {
        // If the entry is new, it will not have an Id.
        if (!newValue[i].id) {
          // Save the entry.
          delete newValue[i].id;
          newValue[i].revisionIdFrom = entity.revisionId;
          newValue[i].revisionIdTo = null;
          yield save.bind(self)(self.drilldown(entity, path.concat([i])));

          // Now process any sub-attributes.
          for (let attribute of self.attributeRegistry.getOrderedElements()) {
            yield attribute.save(entity, path.concat([i, attribute.id]));
          }
        }
      }
    })(this, super.save);
  }

  keysToCheckForChange() {
    return ['weight'];
  }

  valuesHaveChanged(oldValue, newValue) {
    return co(function*(self){
      let keysToCheck = self.keysToCheckForChange();
      for (let key in keysToCheck) {
        if (oldValue[keysToCheck[key]] !== newValue[keysToCheck[key]]) {
          return true;
        }
      }
      return false;
    })(this);
  }

  load(entity, path) {
    return co(function*(self){
      // Set up an object to load the values into.
      let parentValue = self.drilldown(entity, path.slice(0, -1));
      let value = parentValue[self.alias] = [];

      // We don't use the Table.load() function, because we have to give
      // special conditions to handle the revisions.
      let table = sql.define(self.schema());
      let query = table
        .select(table.star())
        .where(
          table.parentId.equals(entity.id)
          .and(table.revisionIdTo.isNull())
        ).toQuery();
      let db = self.engine.database;
      let dball = promisify(db.all, {context: db});
      // Execute the query, then move the items into an object keyed by id.
      let rows = yield dball(query.text, ...query.values);
      rows.forEach(item => value.push(item));

      // Load any sub-attributes.
      for (let i in value) {
        for (let attribute of self.attributeRegistry.getOrderedElements()) {
          yield attribute.load(entity, path.concat([i, attribute.alias]));
        }
      }
    })(this);
  }

  purge(parentIds) {
    return co(function*(self){
      let table = sql.define(self.schema());
      let attributes = self.attributeRegistry.getOrderedElements();
      let toBeDeleted = [];
      if (attributes) {
        // We must get a list of all ids that will be deleted, and pass that
        // list on to any sub-attributes.
        let query = table.select(table.id).where(table.parentId.in(parentIds)).toQuery();
        let db = self.engine.database;
        let dball = promisify(db.all, {context: db});
        let rows = yield dball(query.text, ...query.values);
        rows.forEach(item => toBeDeleted.push(item.id));
      }

      // Purge this attribute.
      // Do not call the super.purge(), in order to delete multiple rows.
      let query = table.delete().where(table.parentId.in(parentIds)).toQuery();
      let stmt = self.engine.database.prepare(query.text);
      let run = promisify(stmt.run, {context: stmt});
      let finalize = promisify(stmt.finalize, {context:stmt});
      yield run(query.values);
      yield finalize();

      // Purge any sub-attributes.
      for (let attribute of attributes) {
        yield attribute.purge(toBeDeleted);
      }
    })(this);
  }

  /*
  addJoin(query, joinAgainst) {
    return joinAgainst.leftJoin(this.table).on(joinAgainst.id.equals(this.table.entityId));
  }
  */

  /**
   * Often, the entire entity object is passed into a function, as well as an
   * array that serves as a drill-down path to the values for this particular
   * object.  This drilldown() function performs a recursive descent so that
   * the correct values can be easily accessed.
   */
  drilldown(entity, path, depth = 0) {
    return path.length == depth ? entity : this.drilldown(entity[path[depth]] === undefined ? entity[path[depth]] = {} : entity[path[depth]], path, depth + 1); 
  }
}

module.exports = Attribute;
