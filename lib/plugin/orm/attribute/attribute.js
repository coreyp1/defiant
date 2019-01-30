"use strict";

const sql = require('sql');
const Table = require('../table');
const Registry = require('../../../util/registry');
const Base = require('../../queryApi/base');
const Field = require('../../queryApi/field');

class Attribute extends Table {
  constructor(engine, relationship, name) {
    super(engine, relationship.name + '_' + name);
    this.relationship = relationship;
    this.attributeName = name;
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

  async createTable() {
    await super.createTable();

    // Create any sub-attributes' tables.
    for (let attribute of this.attributeRegistry.getOrderedElements()) {
      await attribute.createTable();
    }
  }

  async prepare(entity, path) {
    if (!path) {
      // The function was called from the Table.save() function.
      // The prepare() has already been run, so we can safely return.
      return;
    }
    let values = this.drilldown(entity, path);
    for (let i in values) {
      let value = values[i];
      await super.prepare(value);

      // Set defaults (if needed).
      let relationship = this.drilldown(entity, path.slice(0, -1));
      value.parentId = relationship.id;
      value.revisionIdFrom = value.revisionIdFrom || 0;
      value.revisionIdTo = value.revisionIdTo || null;
      value.weight = value.weight || 0;
    }
  }

  async save(entity, path) {
    let newValue = this.drilldown(entity, path);
    let oldValue = this.drilldown(entity.oldValue || {}, path);

    // Call our version of the prepare function.
    await this.prepare(entity, path);

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
        let table = sql.define(this.getSchema());
        let query = table.update({revisionIdTo: entity.revisionId}).where(table.id.equals(oldValue[i].id));
        let stmt = this.engine.database.prepare(query.text);
        await new Promise((accept) => {
          stmt.run(query.values, accept);
        });
        await new Promise((accept) => {
          stmt.finalize(e => {return accept(e);});
          return accept();
        });
      }
      else {
        // Update the entry (if necessary).
        // If there has been a change, update the revision columns.

        // TODO: Don't save if only the weights change but the order is the same.
        if (await this.valuesHaveChanged(oldValue[i], newValue[newValueIndex])) {
          // Set the revisionIdTo of the current record to entity.revisionId.
          let table = sql.define(this.schema());
          let query = table.update({revisionIdTo: entity.revisionId}).where(table.id.equals(oldValue[i].id)).toQuery();
          let stmt = this.engine.database.prepare(query.text);
          await new Promise((accept) => {
            stmt.run(query.values, accept);
          });
          await new Promise((accept) => {
            stmt.finalize(e => {return accept(e);});
            return accept();
          });

          // Add a new record for this revision.
          delete newValue[newValueIndex].id;
          newValue[newValueIndex].revisionIdFrom = entity.revisionId;
          newValue[newValueIndex].revisionIdTo = null;
          await super.save(this.drilldown(entity, path.concat([i])));
        }

        // Now process any sub-attributes.
        for (let attribute of this.attributeRegistry.getOrderedElements()) {
          await attribute.save(entity, path.concat([i, attribute.id]));
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
        await super.save(this.drilldown(entity, path.concat([i])));

        // Now process any sub-attributes.
        for (let attribute of this.attributeRegistry.getOrderedElements()) {
          await attribute.save(entity, path.concat([i, attribute.id]));
        }
      }
    }
  }

  keysToCheckForChange() {
    return ['weight'];
  }

  async valuesHaveChanged(oldValue, newValue) {
    let keysToCheck = this.keysToCheckForChange();
    for (let key in keysToCheck) {
      if (oldValue[keysToCheck[key]] !== newValue[keysToCheck[key]]) {
        return true;
      }
    }
    return false;
  }

  async load(entity, path) {
    // Set up an object to load the values into.
    let parentValue = this.drilldown(entity, path.slice(0, -1));
    let value = parentValue[this.attributeName] = [];

    // We don't use the Table.load() function, because we have to give
    // special conditions to handle the revisions.
    let table = sql.define(this.schema());
    let query = table
      .select(table.star())
      .where(
        table.parentId.equals(entity.id)
        .and(table.revisionIdTo.isNull())
      ).toQuery();
    let db = this.engine.database;
    // Execute the query, then move the items into an object keyed by id.
    let rows = await new Promise((accept) => {
      db.all(query.text, ...query.values, (err, rows) => {
        if (rows) {
          return accept(rows);
        }
        return accept(err);
      });
    });
    rows.forEach(item => value.push(item));

    // Load any sub-attributes.
    for (let i in value) {
      for (let attribute of this.attributeRegistry.getOrderedElements()) {
        await attribute.load(entity, path.concat([i, attribute.attributeName]));
      }
    }
  }

  async purge(parentIds) {
    let table = sql.define(this.schema());
    let attributes = this.attributeRegistry.getOrderedElements();
    let toBeDeleted = [];
    if (attributes) {
      // We must get a list of all ids that will be deleted, and pass that
      // list on to any sub-attributes.
      let query = table.select(table.id).where(table.parentId.in(parentIds)).toQuery();
      let db = this.engine.database;
      let rows = await new Promise((accept) => {
        db.all(query.text, ...query.values, (err, rows) => {
          if (rows) {
            return accept(rows);
          }
          return accept(err);
        });
      });
      rows.forEach(item => toBeDeleted.push(item.id));
    }

    // Purge this attribute.
    // Do not call the super.purge(), in order to delete multiple rows.
    let query = table.delete().where(table.parentId.in(parentIds)).toQuery();
    let stmt = this.engine.database.prepare(query.text);
    await new Promise((accept) => {
      stmt.run(query.values, accept);
    });
    await new Promise((accept) => {
      stmt.finalize(e => {return accept(e);});
      return accept();
    });

    // Purge any sub-attributes.
    for (let attribute of attributes) {
      await attribute.purge(toBeDeleted);
    }
  }

  getQueryFields() {
    let fields = super.getQueryFields();
    fields[`${this.attributeName}_weight`] = new Field(this.engine, {
      tableName: this.name,
      fieldName: 'weight',
    });
    return fields;
  }

  getQueryBase() {
    return new Base(this.engine, {
      id: this.name,
      orm: this.name,
      fields: this.getQueryFields(),
      join: this.getQueryJoins(),
    });
  }

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
