"use strict";

const Plugin = require('../plugin');
const Renderable = require('../theme/renderable');
const Registry = require('../../util/registry');
const fs = require('fs');

class ThemeBase extends Plugin {
  constructor(engine) {
    super(engine);

    this.renderables = {};
    this.parentName = Object.getPrototypeOf(Object.getPrototypeOf(this)).constructor.name;
    this.parent = this.parentName != 'Plugin' ? engine.plugin.get(this.parentName) : undefined;

    engine.plugin.get('Router').router
      // Serve default CSS & JavaScript files.
      .addHandler(new (require('./handler/directoryHandler'))())
      // Serve jQuery and jQuery UI.
      .addHandler(new (require('./handler/jQueryHandler'))())
      .addHandler(new (require('./handler/jQueryUIHandler'))());

    // Add the default Renderables.
    for (let renderable of [
      require('./renderable/page'),
    ]) {
      this.setRenderable(renderable);
    }
  }

  setRenderable(renderable) {
    this.renderables[renderable.name] = renderable;
    renderable.templateContents = fs.readFileSync(renderable.templateFile);
    renderable.templateFunction = Renderable.compileTemplate(renderable.variables, renderable.templateContents, renderable.boilerplate);
    return this;
  }

  getRenderable(name) {
    return this.renderables[name] || (this.parent ? this.parent.getRenderable(name) : undefined);
  }
}

module.exports = ThemeBase;
