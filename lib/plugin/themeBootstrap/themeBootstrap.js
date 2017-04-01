"use strict";

const ThemeBase = require('../themeBase');

class ThemeBootstrap extends ThemeBase {
  constructor(engine) {
    super(engine);
    
    engine.plugin.get('Router').router
      // Serve default CSS & JavaScript files.
      .addHandler(require('./handler/directoryHandler'))
      // Serve jQuery.
      .addHandler(require('./handler/bootstrapDirectoryHandler'));

    // Add the default Renderables.
    for (let renderable of [
      require('./renderable/page'),
    ]) {
      this.setRenderable(renderable);
    }
  }
}

module.exports = ThemeBootstrap;
