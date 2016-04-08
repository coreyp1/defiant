'use strict';

const {coroutine: co} = require('bluebird');

class Plugin {
  constructor(engine) {
    this.engine = engine;
    this.id = this.constructor.name;
    return this;
  }

  init() {
    return co(function* () {})();
  }
}

module.exports = Plugin;
