"use strict";

const Field = require('../queryApi/field');
const merge = require('../../util/merge');
const sql = require('sql');
sql.setDialect('sqlite');

class Table {
  constructor(engine, name) {
    this.engine = engine;
    this.id = name;
    this.name = name;
    this.engine.sql = sql;
    return this;
  }

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

  async createTable() {
    await new Promise((accept) => {
      let table = sql.define(this.schema());
      this.engine.database.run(table.create().ifNotExists().toQuery().text, accept);
    });
  }

  async prepare(entity={}) {
    entity.id = entity.id || undefined;
  }

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
          stmt.finalize(e => {return accept(e);});
          return accept();
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
          stmt.finalize(e => {return accept(e);});
          return accept();
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
        stmt.finalize(e => {return accept(e);});
        return accept();
      });
      return entity;
  }

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

  getQueryFields() {
    return {
      id: new Field(this.engine, {
        tableName: this.id,
        fieldName: 'id',
      }),
    };
  }

  getQueryJoins() {
    return {};
  }
}

module.exports = Table;
