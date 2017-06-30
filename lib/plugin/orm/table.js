"use strict";

const merge = require('../../util/merge');
const {coroutine: co, promisify} = require('bluebird');
const sql = require('sql');
sql.setDialect('sqlite');

class Table {
  constructor(engine, name, alias=null) {
    this.engine = engine;
    this.id = name;
    this.name = name;
    this.alias = alias || this.name;
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

  createTable() {
    let run = promisify(this.engine.database.run, {context: this.engine.database});
    return co(function*(self){
      let table = sql.define(self.schema());
      yield run(table.create().ifNotExists().toQuery().text);
    })(this);
  }

  prepare(entity={}) {
    return co(function*(){
      entity.id = entity.id || undefined;
    })();
  }

  save(entity) {
    return co(function*(self, args){
      yield self.prepare(entity);
      let values = {};
      let table = sql.define(self.schema());
      self.schema().columns.map(column => {
        if (column.name in entity) {
          values[column.name] = entity[column.name];
        }
      });
      // The ID will never be updated/inserted.
      delete values.id;
      if (!entity.id) {
        // This is a new entity.  Insert it into the database.
        let query = table.insert(values).toQuery();
        let stmt = self.engine.database.prepare(query.text);
        let run = promisify(stmt.run, {context: stmt});
        let finalize = promisify(stmt.finalize, {context:stmt});
        yield run(query.values);
        yield finalize();

        // There is no cross-database way to get the inserted id, so query it.
        stmt = self.engine.database.prepare("SELECT LAST_INSERT_ROWID() AS id");
        let get = promisify(stmt.get, {context: stmt});
        finalize = promisify(stmt.finalize, {context:stmt});
        let row = yield get();
        entity.id = row.id;
        yield finalize();
        return entity;
      }
      // This is an existing entity.  Update the database fields.
      let query = table.update(values).where(table.id.equals(entity.id)).toQuery();
      let stmt = self.engine.database.prepare(query.text);
      let run = promisify(stmt.run, {context: stmt});
      let finalize = promisify(stmt.finalize, {context:stmt});
      yield run(query.values);
      yield finalize();
      return entity;
    })(this, arguments);
  }

  load(condition) {
    return co(function*(self){
      let table = sql.define(self.schema());
      let clause = undefined;
      for (let key in condition) {
        let part = table[key].equals(condition[key]);
        clause = !clause ? part : clause.and(part);
      }
      let query = table.select(table.star()).where(clause).limit(1).toQuery();
      let stmt = self.engine.database.prepare(query.text);
      let get = promisify(stmt.get, {context: stmt});
      let finalize = promisify(stmt.finalize, {context:stmt});
      let row = yield get(query.values);
      yield finalize();
      return merge(condition, row);
    })(this);
  }

  purge(condition) {
    return co(function*(self){
      if (!condition) {
        throw new Error("Entity cannot be purged without a condition.");
      }

      let table = sql.define(self.schema());
      let clause = undefined;
      for (let key in condition) {
        let part = table[key].equals(condition[key]);
        clause = !clause ? part : clause.and(part);
      }
      let query = table.delete().where(clause).toQuery();
      let stmt = self.engine.database.prepare(query.text);
      let run = promisify(stmt.run, {context: stmt});
      let finalize = promisify(stmt.finalize, {context:stmt});
      yield run(query.values);
      yield finalize();
      return;
    })(this);
  }
}

module.exports = Table;
