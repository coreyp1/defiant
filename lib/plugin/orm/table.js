"use strict";

const Field = require('../queryApi/field');
const merge = require('../../util/merge');
const sql = require('sql');
sql.setDialect('sqlite');

/**
 * The Table object represents a table in a relational database.  It serves as
 * the base class for the data storage mechanisms of this and related modules.
 * @class
 * @memberOf Defiant.Plugin.Orm
 */
class Table {
  /**
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @param {String} name
   *   The name of the table.
   * @returns {Defiant.Plugin.Orm.Table}
   *   The instantiated Table object.
   */
  constructor(engine, name) {
    /**
     * @member {Defiant.Engine} Defiant.Plugin.Orm.Table#engine
     *   The app engine.
     */
    this.engine = engine;

    /**
     * @member {String} Defiant.Plugin.Orm.Table#id
     *   The unique identifier of the Table.
     */
    this.id = name;

    /**
     * @member {String} Defiant.Plugin.Orm.Table#name
     *   The name of the table in the database.
     */
    this.name = name;

    /**
     * @member {Boolean} Defiant.Plugin.Orm.Table#initialized
     *   Whether or not the table has been initialized.
     */
    this.initialized = false;

    /**
     * @member {Object} Defiant.Plugin.Orm.Table#sql
     *   A reference to the `SQL` module.
     */
    this.engine.sql = sql;
    return this;
  }

  /**
   * Return the schema of the Table.
   *
   * Override this method to customize which columns and their associated types
   * are made part of the table.
   * @function
   * @returns {Object}
   *   A description of the table.
   */
  schema() {
    return {
      name: this.name,
      // Column types are: serial, varchar(<size>), int,
      columns: [{
        name: 'id',
        dataType: 'INTEGER',
        primaryKey: true,
      }],
      keys: [],
    };
  }

  /**
   * Create the Table in the database.
   * @function
   * @async
   */
  async init() {
    await new Promise((accept) => {
      let table = sql.define(this.schema());
      this.engine.database.run(table.create().ifNotExists().toQuery().text, accept);
    });
    this.initialized = true;
  }

  /**
   * Prepare an entity (row in the database) to be written, making sure that
   * necessary fields are populated properly.
   * @function
   * @async
   * @param {Object} [entity={}]
   *   The entity (row) to be written.
   */
  async prepare(entity={}) {
    entity.id = entity.id || undefined;
  }

  /**
   * Save the Entity (row) in the Table.
   * @function
   * @async
   * @param {Object} entity
   *   The entity to be saved.
   */
  async save(entity) {
      await this.prepare(entity);
      let values = {};
      let table = sql.define(this.schema());
      this.schema().columns.map(column => {
        if (column.name in entity) {
          values[column.name] = entity[column.name];
        }
      });
      // The ID will never be updated/inserted.
      delete values.id;
      if (!entity.id) {
        // This is a new entity.  Insert it into the database.
        let query = table.insert(values).toQuery();
        let stmt = this.engine.database.prepare(query.text);
        await new Promise((accept) => {
          stmt.run(query.values, accept);
        });
        await new Promise((accept) => {
          stmt.finalize(e => accept(e));
        });

        // There is no cross-database way to get the inserted id, so query it.
        stmt = this.engine.database.prepare("SELECT LAST_INSERT_ROWID() AS id");
        let row = await new Promise((accept) => {
          stmt.get((err, row) => {
            return row ? accept(row) : accept(err);
          });
        });
        entity.id = row.id;
        await new Promise((accept) => {
          stmt.finalize(e => accept(e));
        });
        return entity;
      }
      // This is an existing entity.  Update the database fields.
      let query = table.update(values).where(table.id.equals(entity.id)).toQuery();
      let stmt = this.engine.database.prepare(query.text);
      await new Promise((accept) => {
        stmt.run(query.values, accept);
      });
      await new Promise((accept) => {
        stmt.finalize(e => accept(e));
      });
      return entity;
  }

  /**
   * Load a single row from the Table.
   * @function
   * @async
   * @param {Map<String,String|number>} condition
   *   A key/value pair representing the condition to be matched.
   */
  async load(condition) {
    let table = sql.define(this.schema());
    let clause = undefined;
    for (let key in condition) {
      let part = table[key].equals(condition[key]);
      clause = !clause ? part : clause.and(part);
    }
    let query = table.select(table.star()).where(clause).limit(1).toQuery();
    let stmt = this.engine.database.prepare(query.text);
    let row = await new Promise((accept) => {
      stmt.get(query.values, (err, row) => {
        return row ? accept(row) : accept(err);
      });
    });
    await new Promise((accept) => {
      stmt.finalize(e => {return accept(e);});
      return accept();
    });
    return merge(condition, row);
  }

  /**
   * Purge a single row from the Table.
   *
   * The reason that this is called `purge` rather than `delete` is to make it
   * overly clear that the record is being removed from the database, whereas
   * some other `delete` functions may only hide the data from display without
   * actually removing the data from the database.
   * @function
   * @async
   * @param {Map<String,String|number>} condition
   *   A key/value pair representing the condition to be matched.
   */
  async purge(condition) {
    if (!condition) {
      throw new Error("Entity cannot be purged without a condition.");
    }

    let table = sql.define(this.schema());
    let clause = undefined;
    for (let key in condition) {
      let part = table[key].equals(condition[key]);
      clause = !clause ? part : clause.and(part);
    }
    let query = table.delete().where(clause).toQuery();
    let stmt = this.engine.database.prepare(query.text);
    await new Promise((accept) => {
      stmt.run(query.values, accept);
    });
    await new Promise((accept) => {
      stmt.finalize(e => {return accept(e);});
      return accept();
    });
  }

  /**
   * Return the list of fields available for use in a query by the
   * [QueryAPI]{@link Defiant.Plugin.QueryApi}.
   * @function
   * @returns {Map<String,Defiant.Plugin.QueryApi.Field>}
   *   Key/value pairs representing the queryable fields.
   */
  getQueryFields() {
    return {
      id: new Field(this.engine, {
        tableName: this.id,
        fieldName: 'id',
      }),
    };
  }

  /**
   * Return the list of joins available for use in a query by the
   * [QueryApi]{@link Defiant.Plugin.QueryApi}.
   * @function
   * @returns {Map<String,Object>}
   *   Key/value pairs representing the available joins.
   */
  getQueryJoins() {
    return {};
  }
}

module.exports = Table;
