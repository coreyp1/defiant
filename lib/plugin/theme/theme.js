"use strict";

const Plugin = require('../plugin');
const Renderable = require('./renderable');
const Registry = require('../../util/registry');
const fs = require('fs');

class Theme extends Plugin {
  constructor(engine) {
    super('theme', engine);
    this.renderable = {
      'page': require('./renderable/page'),
    };
    for (let name of Object.keys(this.renderable)) {
      let renderable = this.renderable[name];
      renderable.templateContents = fs.readFileSync(renderable.templateFile);
      renderable.templateFunction = Renderable.compileTemplate(renderable.variables, renderable.templateContents);
    }
    engine.plugin.get('router').router
      .addHandler(require('./defaultThemeHandler'));
  }
}

module.exports = Theme;
