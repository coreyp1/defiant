"use strict";

const Plugin = require('../plugin');
const Renderable = require('../theme/renderable');
const InitRegistry = require('../../util/initRegistry');
const ServeDirectoryHandler = require('../router/handler/serveDirectoryHandler');
const path = require('path');
const fs = require('fs');

class ThemeBase extends Plugin {
  constructor(engine) {
    super(engine);

    this.renderables = new InitRegistry({}, [engine]);
    this.parentName = Object.getPrototypeOf(Object.getPrototypeOf(this)).constructor.name;
    this.parent = this.parentName != 'Plugin' ? engine.pluginRegistry.get(this.parentName) : undefined;

    engine.pluginRegistry.get('Router')
      // Serve default CSS & JavaScript files.
      .addHandler(new ServeDirectoryHandler({
        id: 'ThemeBase.DirectoryHandler',
        path: 'file/theme/themeBase',
        target: path.join(__dirname, 'file'),
        menu: undefined,
        fileOptions: {},
        directoryOptions: undefined,
      }));

    // Add the default Renderables.
    for (let renderable of [
      require('./renderable/page'),
    ]) {
      this.setRenderable(renderable);
    }
  }

  setRenderable(renderable) {
    this.renderables.set(renderable);
    if (renderable.templateFile) {
      renderable.templateContents = fs.readFileSync(renderable.templateFile);
      renderable.templateFunction = Renderable.compileTemplate(renderable.variables, renderable.templateContents, renderable.boilerplate);
    }
    return this;
  }

  getRenderable(name) {
    return this.renderables.get(name) || (this.parent ? this.parent.getRenderable(name) : undefined);
  }
}

module.exports = ThemeBase;
