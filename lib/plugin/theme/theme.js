"use strict";

const Plugin = require('../plugin');

class Theme extends Plugin {
  constructor(engine) {
    super(engine);
    engine.pluginRegistry.get('Router')
      .addHandler(new (require('./handler/defaultThemeHandler'))());

    // Register Theme elements
    engine.pluginRegistry.get('ThemeBase')
      .setRenderable(require('./renderable/tagSingle.js'))
      .setRenderable(require('./renderable/tagPair.js'));
  }
}

module.exports = Theme;
