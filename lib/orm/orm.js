'use strict';

const {coroutine: co} = require('bluebird');
const Plugin = require('../plugin');
const Registry = require('../util/registry');
const sqlite3 = require('sqlite3');
const sql = require('sql');

class Orm {
  constructor(engine) {
    this.engine = engine;
    this.id = this.constructor.name;
    this.entity = new Registry();
    let Entity = require('./entity');
    this.entity.set(new Entity(engine, 'testEntity', 'foo'));
    this.engine.database = null;
    return this;
  }

  init() {
    return co(function*(self) {
      self.engine.database = new sqlite3.Database('/var/defiant/sqlite.db');
      for (let entity of self.entity.getOrderedElements()) {
        yield entity.createTable();
      }
      //* This example Creates and Updates 3 Entity objects.
      let Entity = self.entity.get('testEntity');
      yield Entity.save({});
      yield Entity.save({});
      let e = {};
      yield Entity.save(e);
      e.uuid = e.uuid.toUpperCase();
      yield Entity.save(e);
      yield Entity.save(e);
      console.log(yield Entity.load({id:7}));
      yield Entity.purge({uuid: e.uuid});
      //*/
    })(this);
  }
}

Orm.Relationship = {
  oneToOne: 'oneToOne',
  oneToMany: 'oneToMany',
};

module.exports = Orm;
