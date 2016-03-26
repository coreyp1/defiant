"use strict";

const Plugin = require('../plugin');

class Example extends Plugin {
  constructor(engine) {
    super(engine);
    engine.plugin.get('Router').router
      .addHandler(require('./handler/textHandler'))
      .addHandler(require('./handler/jsonHandler'))
      .addHandler(require('./handler/themedHandler'))
      .addHandler(require('./handler/fapiHandler'));
    engine.plugin.get('Fapi')
      .setForm(require('./form/exampleForm'));
  }
}

module.exports = Example;
