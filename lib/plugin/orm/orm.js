'use strict';

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const sqlite3 = require('sqlite3');

class Orm extends Plugin {
  constructor(engine) {
    super(engine);
    this.entityRegistry = new Registry();
    this.engine.database = null;

    let fieldFormatRegistry = this.engine.pluginRegistry.get('QueryApi').fieldFormatRegistry;
    fieldFormatRegistry
      .set(require('./format/fieldFormatUuidLink'));

    /* Build a sample entity type.
    let weird = new (require('./entity'))(engine, 'weird', 'foo');
    let one = new (require('./attribute/text'))(engine, weird, 'one');
    weird.attributeRegistry.set(one);
    let two = new (require('./attribute/integer'))(engine, one, 'two');
    one.attributeRegistry.set(two);
    let three = new (require('./attribute/float'))(engine, weird, 'three');
    weird.attributeRegistry.set(three);
    this.entityRegistry.set(weird);
    //*/
    return this;
  }

  async init() {
    // TODO: The database path should be configurable.
    this.engine.database = new sqlite3.Database('/var/defiant/sqlite.db');

    let BaseRegistry = this.engine.pluginRegistry.get('QueryApi').baseRegistry;
    for (let entity of this.entityRegistry.getOrderedElements()) {
      // Create the Entity tables (if necessary).
      await entity.createTable();

      // Register the entities and their attributes with QueryApi.
      if (typeof entity.getQueryBase === 'function') {
        BaseRegistry.set(entity.getQueryBase());
        for (let attribute of entity.attributeRegistry.getOrderedElements()) {
          if (typeof attribute.getQueryBase === 'function') {
            BaseRegistry.set(attribute.getQueryBase());
          }
        }
      }
    }

    /* Building an entity programmatically.
    let e = {
      one: [{
          value: "foo",
          two: [{value: 18}, {value: 42}],
        }, {
          value: "bar",
        }, {
          value: "baz",
          two: [{value: -3}, {value: -50000}],
        }],
      three: [{value: 2.5}, {value: -3.14}],
    };
    let E = this.entityRegistry.get('weird');
    await E.save(e);
    let f = {id: e.id};
    await E.load(f);
    console.log(e);
    console.log(f);
    await E.purge(f.id);
    //*/
  }
}

module.exports = Orm;
