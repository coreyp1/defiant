"use strict";

const Registry = require('../../../util/registry');
const RenderableInstance = require('./renderableInstance');

class CollectionInstance extends RenderableInstance {
  constructor(renderable, setup, context) {
    super(renderable, setup, context);
    this.instanceRegistry = new Registry();
  }

  async init(data={}) {
    await super.init(data);
    for (let instance of this.instanceRegistry.getOrderedElements()) {
      await instance.init();
    }
  }

  async commit() {
    return this.instanceRegistry.getOrderedElements()
    .map(item => item.commit(this.data[item.id]))
    .join('');
  }

  addInstance(instance) {
    this.instanceRegistry.set(instance);
    instance.parent = this;
    return this;
  }

  getAllElementsRecursive() {
    // NOTE: Intentionally leaving this as a generator.
    let self = this;
    return function*() {
      for (let instance of self.instanceRegistry.getOrderedElements()) {
        yield instance;
        if (instance.getAllElementsRecursive) {
          yield* instance.getAllElementsRecursive();
        }
      }
    }();
  }
}

module.exports = CollectionInstance;
