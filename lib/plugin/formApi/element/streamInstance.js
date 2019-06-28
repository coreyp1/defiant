"use strict";

const RenderableInstance = require('../../theme/renderable/renderableInstance');
const ElementInstance = require('./elementInstance');

class StreamInstance extends ElementInstance {
  constructor(renderable, setup, context) {
    super(renderable, setup, context);
    this.order = [];
  }

  async commit() {
    let content = '';
    for (let item of this.order) {
      content += (typeof item === 'string')
        ? item
        : await item.commit();
    }
    if (this.wrap && (this.wrap instanceof RenderableInstance)) {
      await this.wrap.init({content});
      return await this.wrap.commit();
    }
    return content;
  }

  addInstance(instance) {
    this.order.push(instance);

    // Even though the order is being tracked separately, we still want to
    // maintain the registry so that normal interaction with this element still
    // functions as expected.
    if (typeof instance !== 'string') {
      super.addInstance(instance);
    }
    return this;
  }
}

module.exports = StreamInstance;
