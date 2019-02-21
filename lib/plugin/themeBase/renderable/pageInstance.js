"use strict";

const RenderableInstance = require('../../theme/renderable/renderableInstance');

class PageInstance extends RenderableInstance {
  async init(data={}) {
    // Add the default CSS & Javascript Files.
    this.context.engine.library.require(this.context, 'Materialize');

    // Add any library JavaScript & CSS.
    this.context.engine.library.process(this.context);

    await super.init(data);
  }
}

module.exports = PageInstance;
