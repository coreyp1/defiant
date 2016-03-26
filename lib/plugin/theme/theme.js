"use strict";

const Plugin = require('../plugin');

class ThemeManager extends Plugin {
  constructor(engine) {
    super(engine);
    engine.plugin.get('Router').router
      .addHandler(require('./defaultThemeHandler'));
  }
}

module.exports = ThemeManager;
