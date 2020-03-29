"use strict";

const sql = require('sql');
const Table = require('../table');
const Registry = require('../../../util/registry');
const Base = require('../../queryApi/base');
const Field = require('../../queryApi/field');
const merge = require('../../../util/merge');

/**
 * Attribute is the base class from which all other types of attributes should
 * be built.  Attributes are added to
 * [Entities]{@link Defiant.Plugin.Orm.Entity} as a method to extend the data
 * associated with the Entity using pre-defined Attribute types.  Attributes
 * support revision histories.
 * @class
 * @extends Defiant.Plugin.Orm.Table
 * @memberOf Defiant.Plugin.Orm
 */
class Attribute extends Table {
  /**
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @param {Defiant.Plugin.Orm.Entity} relationship
   *   The Entity table that this Revision table is associated with.
   * @param {String} name
   *   The name of the attribute within the Entity
   * @param {Object} data
   *   Data neede for the initialization of this particular Attribute type.
   * @returns {Defiant.Plugin.Orm.Attribute}
   *   The instantiated Attribute object.
   */
  constructor(engine, relationship, name, data={}) {
    super(engine, relationship.id + '_' + name);
    this.name = relationship.name + '_' + name;

    /**
     * @member {Defiant.Plugin.Orm.Entity} Defiant.Plugin.Orm.Attribute#relationship
     *   The Entity that this Attribute is associated with.
     */
    this.relationship = relationship;

    /**
     * @member {String} Defiant.Plugin.Orm.Attribute#attributeName
     *   The name of this attribute within the Entity.
     */
    this.attributeName = name;

    /**
     * @member {Defiant.util.Registry} Defiant.Plugin.Orm.Attribute#attributeRegistry
     *   A registry of sub-attributes that are included with this attribute.
     */
    this.attributeRegistry = new Registry();

    /**
     * @member {Object} Defiant.Plugin.Orm.Attribute#data
     *   The data for this instance.
     */
    this.data = merge({
      count: 1,
    }, data);
    engine.pluginRegistry.get('Orm').entityRegistry.set(this);
    ['formType'].map(key => this[key] = data[key] ? data[key] : this.constructor[key]);

    return this;
  }

  /**
   * Returns the schema of the table.
   *
   * Override this method to customize which columns and their associated types
   * are made part of the table.
   * @function
   * @returns {Object}
   *   A description of the table.
   */
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

  /**
   * Create the table in the database for this attribute and any sub-attributes.
   * @function
   * @async
   */
  async createTable() {
    await super.createTable();

    // Create any sub-attributes' tables.
    for (let attribute of this.attributeRegistry.getOrderedElements()) {
      await attribute.createTable();
    }
  }

  /**
   * Prepare an attribute to be written, making sure that necessary fields are
   * populated properly.  Do the same for the sub-attributes.
   * @function
   * @async
   * @param {Defiant.Plugin.Orm.Entity} entity
   *   The parent Entity.
   * @param {String[]} path
   *   The drill-down path to find the correct values in the object.
   */
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

  /**
   * Save the Attribute and any sub-attributes.
   * @function
   * @async
   * @param {Defiant.Plugin.Orm.Entity} entity
   *   The parent Entity.
   * @param {String[]} path
   *   The drill-down path to find the correct values in the object.
   */
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
      if ((newValueIndex === undefined) || await this.valueIsEmpty(newValue[newValueIndex])) {
        // The oldValue[i] must be "removed" from the record.
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
      if (!newValue[i].id && !await this.valueIsEmpty(newValue[i])) {
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

  /**
   * Return an array of keys that the Attribute should check that, if the value
   * has changed, then a new revision must be created.
   * @function
   * @returns {String[]}
   *   The names of values that need to be checked in order to realize that the
   *   a new revision must be created.
   */
  keysToCheckForChange() {
    return ['weight'];
  }

  /**
   * Determine whether or not the values have changed.
   * @function
   * @async
   * @param {Map<String, Mixed>} oldValue
   *   The original value.
   * @param {Map<String, Mixed>} newValue
   *   The new value.
   * @returns {boolean}
   *   Return `true` if the values have changed, otherwise return `false`.
   */
  async valuesHaveChanged(oldValue, newValue) {
    let keysToCheck = this.keysToCheckForChange();
    for (let key in keysToCheck) {
      if (oldValue[keysToCheck[key]] !== newValue[keysToCheck[key]]) {
        return true;
      }
    }
    return false;
  }

  /**
   * Determine whether or not the value is empty.
   * @function
   * @async
   * @param {Mixed} value
   *   The value to be checked.
   * @returns {boolean}
   *   Return `true` if the value is empty, otherwise return `false`.
   */
  async valueIsEmpty(value) {
    return false;
  }

  /**
   * Load an attribute and all of its sub-attributes.
   * @function
   * @async
   * @param {Defiant.Plugin.Orm.Entity} entity
   *   The parent Entity.
   * @param {String[]} path
   *   The drill-down path to find the correct values in the object.
   */
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

  /**
   * Purge the attribute and all sub-attributes from the database.
   * @function
   * @async
   * @param {number[]} parentIds
   *   An array of Entity IDs to match against.
   */
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

  /**
   * Return the list of fields available for use in a query by the
   * [QueryAPI]{@link Defiant.Plugin.QueryApi}.
   * @function
   * @returns {Map<String,Defiant.Plugin.QueryApi.Field>}
   *   Key/value pairs representing the queryable fields.
   */
  getQueryFields() {
    let fields = super.getQueryFields();
    fields[`${this.attributeName}_weight`] = new Field(this.engine, {
      tableName: this.id,
      fieldName: 'weight',
    });
    return fields;
  }

  /**
   * Return the [Query Base]{@link Defiant.Plugin.QueryApi.Base} associated with
   * this attribute.
   * @function
   * @returns {Defiant.Plugin.QueryApi.Base}
   *   The Query Base associated with this attribute.
   */
  getQueryBase() {
    return new Base(this.engine, {
      id: this.id,
      orm: this.id,
      fields: this.getQueryFields(),
      join: this.getQueryJoins(),
    });
  }

  /**
   * Drilldown is a helper function to make it easy to find the values at a
   * particular path of keys through nested objects.
   *
   * Often, the entire entity object is passed into a function, as well as an
   * array that serves as a drill-down path to the values for this particular
   * object.  This drilldown() function performs a recursive descent so that
   * the correct values can be easily accessed.
   * @function
   * @param {Defiant.Plugin.Orm.Entity} entity
   *   The objected being drilled-down through.
   * @param {String[]} path
   *   An array representing the paths to descend through.
   * @param {number} [depth=0]
   *   The current depth of the path array.
   * @returns {Object}
   *   The object that was found at the end of the drill-down procedure.
   */
  drilldown(entity, path, depth = 0) {
    return path.length == depth
      ? entity
      : this.drilldown(entity[path[depth]] === undefined
        ? entity[path[depth]] = {}
        : entity[path[depth]], path, depth + 1);
  }

  /**
   * This function is called when the attribute needs to be added to a form.
   * The entity is in formInstance.entity.
   * @function
   * @async
   * @param {Defiant.Plugin.FormApi.ElementInstance} elementInstance
   *   The element instance to which form elements for this attribute must be
   *   added.
   */
  async formInit(elementInstance) {
    const formInstance = elementInstance.formInstance;
    const FormApi = formInstance.context.engine.pluginRegistry.get('FormApi');
    const Hidden = FormApi.getElement('Hidden');
    const Encrypt = FormApi.getElement('Encrypt');
    elementInstance
      .addInstance(Encrypt.newInstance(formInstance.context, {
        name: `${elementInstance.name}[id]`,
        data: {
          value: String(elementInstance.attribute.id || 0),
        },
      }))
      .addInstance(Hidden.newInstance(formInstance.context, {
        name: `${elementInstance.name}[weight]`,
        data: {
          defaultValue: String(elementInstance.attribute.weight || 0),
        },
      }));
    elementInstance.weight = parseFloat((formInstance.context.post && formInstance.context.post[formInstance.id] && (formInstance.context.post[formInstance.id][`${elementInstance.name}[weight]`] !== undefined))
      ? formInstance.context.post[formInstance.id][`${elementInstance.name}[weight]`]
      : (elementInstance.attribute.weight || 0));
  }

  /**
   * This function is called when a form has been submitted and the attribute
   * needs to be validated.  The entity is in formInstance.entity.
   * @function
   * @async
   * @param {Defiant.Plugin.FormApi.ElementInstance} elementInstance
   *   The element instance to which form elements for this attribute must be
   *   added.
   */
  async formValidate(elementInstance) {}

  /**
   * This function is called when a form has passed validation and the attribute
   * needs to be added to the formInstance.entity object.
   * @function
   * @async
   * @param {Defiant.Plugin.FormApi.ElementInstance} elementInstance
   *   The element instance to which form elements for this attribute must be
   *   added.
   */
  async formSubmit(elementInstance) {
    const formInstance = elementInstance.formInstance;
    elementInstance.attribute.weight = formInstance.context.post[formInstance.id][`${elementInstance.name}[weight]`];
  }
}

/**
 * @member {String} Defiant.Plugin.Orm.Attribute#formType
 *   When calling Attribute.form{Init, Validate, Submit}, declare how this
 *   attributes should be processed.  Options are `individual` or `group`.
 */
Attribute.formType = 'individual';

module.exports = Attribute;
