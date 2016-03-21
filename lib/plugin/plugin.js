"use strict";

class Plugin {
  constructor(id, engine) {
    if ((typeof(id) == 'object') && (engine == undefined)) {
      // TODO: Change to destructuring.
      engine = id;
      id = undefined;
    }
    this.engine = engine;
    this.id = id;
    return this;
  }
}

module.exports = Plugin;
