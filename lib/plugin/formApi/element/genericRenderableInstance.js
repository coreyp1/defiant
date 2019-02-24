"use strict";

const ElementInstance = require('./elementInstance');

class GenericRenderableInstance extends ElementInstance {
  async commit() {
    return await this.data.renderableInstance.commit();
  }
}

module.exports = GenericRenderableInstance;
