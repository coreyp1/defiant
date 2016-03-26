"use strict";

const Plugin = require('../plugin');
const Renderable = require('./renderable');
const Registry = require('../../util/registry');
const fs = require('fs');

class Theme extends Plugin {
  constructor(engine) {
    super(engine);

    this.renderables = {};
    this.parentName = Object.getPrototypeOf(Object.getPrototypeOf(this)).constructor.name;
    this.parent = this.parentName != 'Plugin' ? engine.plugin.get(this.parentName) : undefined;

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

module.exports = Theme;
