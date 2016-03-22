"use strict";

const Plugin = require('../plugin');

class Example extends Plugin {
  constructor(engine) {
    super(engine);
    engine.plugin.get('Router').router
      .addHandler(require('./textHandler'))
      .addHandler(require('./jsonHandler'))
      .addHandler(require('./themedHandler'))
      .addHandler(require('./fapiHandler'));
  }
}

module.exports = Example;
