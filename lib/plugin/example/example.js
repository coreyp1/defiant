"use strict";

const Plugin = require('../plugin');

class Example extends Plugin {
  constructor(engine) {
    super('example', engine);
    engine.plugin.get('router').router
      .addHandler(require('./textHandler'))
      .addHandler(require('./jsonHandler'));
  }
}

module.exports = Example;
