"use strict";

const Plugin = require('../plugin');
const Renderable = require('./renderable');
const Registry = require('../../util/registry');
const fs = require('fs');

class Theme extends Plugin {
  constructor(engine) {
    super(engine);
    this.renderable = {
      'page': require('./renderable/page'),
    };
    for (let name of Object.keys(this.renderable)) {
      let renderable = this.renderable[name];
      renderable.templateContents = fs.readFileSync(renderable.templateFile);
      renderable.templateFunction = Renderable.compileTemplate(renderable.variables, renderable.templateContents);
    }
    engine.plugin.get('Router').router
      .addHandler(require('./defaultThemeHandler'));

    // Determine the inheritance chain of the Theme.
    this.inheritanceChain = Array.from((current =>
      function*() {
        while ((current = Object.getPrototypeOf(current)) && (current.constructor.name != 'Plugin')) {
          yield current.constructor.name;
        }
      }())(this));
  }
}

module.exports = Theme;
