"use strict";

const Registry = require('../util/registry');

class ormRegistry extends Registry {
  set(obj, engine) {
    return super.set(new obj(engine));
  }
}

module.exports = ormRegistry;
