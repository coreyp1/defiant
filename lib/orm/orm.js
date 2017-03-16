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
      /* This example Creates and Updates an entity. 
      let Entity = self.entity.get('testEntity');
      let e = {x:{1:{}}};
      yield Entity.save(e);
      console.log(e);
      for (let key in e.x) {
        e.x[key].weight -= 8;
      }
      yield Entity.save(e);
      console.log(e);

      //* this Example test loads the Entity that was just created.
      let f = {};
      yield Entity.load({id: e.id});
      console.log(f);

      //* This example Creates and Purges an entity.
      let g = {x:{1:{}}};
      yield Entity.save(g);
      yield Entity.purge(g.id);
      //*/
    })(this);
  }
}

module.exports = Orm;
