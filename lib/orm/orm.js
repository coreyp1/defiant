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
    this.engine.database = null;

    //* Build a sample entity type.
    let weird = new (require('./entity'))(engine, 'weird', 'foo');
    let one = new (require('./attribute/text'))(engine, weird, 'one');
    weird.attributes.set(one);
    let two = new (require('./attribute/integer'))(engine, one, 'two');
    one.attributes.set(two);
    let three = new (require('./attribute/float'))(engine, weird, 'three');
    weird.attributes.set(three);
    this.entity.set(weird);
    //*/
    return this;
  }

  init() {
    return co(function*(self) {
      self.engine.database = new sqlite3.Database('/var/defiant/sqlite.db');
      for (let entity of self.entity.getOrderedElements()) {
        yield entity.createTable();
      }

      /* Building an entity programmatically.
      let e = {
        one: {
          1: {
            value: "foo",
            two: {
              1: {value: 18},
              2: {value: 42},
            },
          },
          2: {
            value: "bar",
          },
          3: {
            value: "baz",
            two: {
              1: {value: -3},
              2: {value: -50000},
            },
          },
        },
        three: {
          1: {value: 2.5},
          2: {value: -3.14},
        }
      };
      let E = self.entity.get('weird');
      yield E.save(e);
      let f = {id: e.id};
      yield E.load(f);
      yield E.purge(f.id);
      //*/
    })(this);
  }
}

module.exports = Orm;
