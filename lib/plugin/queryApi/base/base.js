"use strict";

const Registry = require('../../../util/registry');

class Base {
  constructor(engine, data={}) {
    this.engine = engine;
    this.data = data;
    ['id'].map(key => this[key] = data[key] ? data[key] : this.constructor[key]);
  }

  getTable() {
    let Orm = this.engine.pluginRegistry.get('Orm');
    let Table = Orm.entityRegistry.get(this.id);
    return this.engine.sql.define(Table.schema());
  }
}

Base.id = '';
module.exports = Base;
