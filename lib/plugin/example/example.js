"use strict";

const Plugin = require('../plugin');

class Example extends Plugin {
  constructor(engine) {
    super(engine);
    engine.plugin.get('Router')
      .addHandler(new (require('./handler/textHandler'))())
      .addHandler(new (require('./handler/jsonHandler'))())
      .addHandler(new (require('./handler/themedHandler'))())
      .addHandler(new (require('./handler/fapiHandler'))())
      .addHandler(new (require('./handler/frontPageHandler'))())
      .addHandler(new (require('./handler/directoryHandler'))())
      .addHandler(new (require('./handler/adminHandler'))())
      .addHandler(new (require('./handler/alwaysProcessHandler'))());
    engine.plugin.get('Fapi')
      .setForm(require('./form/exampleForm'));
  }
}

module.exports = Example;
