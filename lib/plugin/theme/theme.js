"use strict";

const Plugin = require('../plugin');

class Theme extends Plugin {
  constructor(engine) {
    super(engine);
    engine.plugin.get('Router').router
      .addHandler(require('./defaultThemeHandler'));

    // Register Theme elements
    engine.plugin.get('ThemeBase')
      .setRenderable(require('./renderable/tagSingle.js'))
      .setRenderable(require('./renderable/tagPair.js'))
  }
}

module.exports = Theme;
