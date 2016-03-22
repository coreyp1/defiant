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
    this.parent = engine.plugin.get(this.parentName);

    // Add the default Renderables.
    for (let renderable of [
      require('./renderable/page'),
    ]) {
      this.addRenderable(renderable);
    }

    // Determine the inheritance chain of the Theme.
    this.inheritanceChain = Array.from((current =>
      function*() {
        while ((current = Object.getPrototypeOf(current)) && (current.constructor.name != 'Plugin')) {
          yield current.constructor.name;
        }
      }())(this));
  }

  addRenderable(renderable) {
    this.renderables[renderable.id] = renderable;
    renderable.templateContents = fs.readFileSync(renderable.templateFile);
    renderable.templateFunction = Renderable.compileTemplate(renderable.variables, renderable.templateContents);
  }

  getRenderable(name) {
    return this.renderables[name] || this.parent.getRenderable ? this.parent.getRenderable(name) : undefined;
  }
}

module.exports = Theme;
