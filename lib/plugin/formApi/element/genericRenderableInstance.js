"use strict";

const ElementInstance = require('./elementInstance');
const Renderable = require('../../theme/renderable');
const RenderableInstance = require('../../theme/renderable/renderableInstance');

class GenericRenderableInstance extends ElementInstance {
  constructor(renderable, setup, context) {
    super(renderable, setup, context);
    ['renderable', 'renderableSetup'].map(key => this[key] = setup[key] ? setup[key] : this.constructor[key]);
  }

  async init(data={}) {
    if (this.renderable instanceof Renderable) {
      this.renderableInstance = this.renderable.newInstance(this.context, this.renderableSetup || {});
      await this.renderableInstance.init();
    }
    await super.init(data);
  }

  async commit() {
    return (this.renderableInstance instanceof RenderableInstance) ? await this.renderableInstance.commit() : '';
  }
}

module.exports = GenericRenderableInstance;
