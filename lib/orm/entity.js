"use strict";

const uuid = require('node-uuid');
const {coroutine: co, promisify} = require('bluebird');
const sql = require('sql');
const Registry = require('../util/registry');
const Table = require('./table');
const Attribute = require('./attribute');
sql.setDialect('sqlite');

class Entity extends Table {
  constructor(engine, name, alias = null) {
    super(engine, name, alias);

    this.attributes = new Registry();
    this.attributes.set(new Attribute(engine, 'x'));
    return this;
  }

  schema() {
    let schema = super.schema();
    schema.columns = schema.columns.concat([{
      name: 'uuid',
      dataType: 'VARCHAR(36)',
      notNull: true,
      unique: true,
    }]);
    schema.keys = schema.keys.concat(['uuid']);
    return schema;
  }

  prepare(entity = {}) {
    return co(function*(prepare){
      yield prepare(entity);
      entity.uuid = entity.uuid || uuid.v4();
      return entity;
    })(super.prepare);
  }
/*
  save(entity) {
    return co(function*(self){
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
        query = table.select(table.id).from(table).where(table.uuid.equals(entity.uuid)).limit(1).toQuery();
        stmt = self.engine.database.prepare(query.text);
        let get = promisify(stmt.get, {context: stmt});
        finalize = promisify(stmt.finalize, {context:stmt});
        let row = yield get(query.values);
        entity.id = row.id;
        return yield finalize();
      }
      // This is an existing entity.  Update the database fields.
      let query = table.update(values).where(table.id.equals(entity.id)).toQuery();
      let stmt = self.engine.database.prepare(query.text);
      let run = promisify(stmt.run, {context: stmt});
      let finalize = promisify(stmt.finalize, {context:stmt});
      yield run(query.values);
      return yield finalize();
    })(this);
  }
*/
/*
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
      return row;
    })(this);
  }
*/
/*
  purge(condition) {
    return co(function*(self){
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
      return yield finalize();
    })(this);
  }
*/
}

module.exports = Entity;
