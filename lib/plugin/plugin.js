'use strict';

class Plugin {
  constructor(engine) {
    this.engine = engine;
    this.id = this.constructor.name;
    return this;
  }

  async init() {
    // Just a stub.
  }
}

module.exports = Plugin;
