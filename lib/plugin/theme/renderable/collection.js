"use strict";

const Renderable = require('./renderable');
const Registry = require('../../../util/registry');

class Collection extends Renderable {
  constructor(data) {
    super(data);
    this.elementRegistry = new Registry();
  }

  addElement(element) {
    this.elementRegistry.set(element);
    element.parent = this;
    return this;
  }

  async init(context, data) {
    await super.init(context, data);
    for (let element of this.elementRegistry.getOrderedElements()) {
      await element.init(context);
    }
  }

  commit() {
    return this.elementRegistry.getOrderedElements().map(item => item.commit()).join('');
  }

  getAllElementsRecursive() {
    // NOTE: Intentionally leaving this as a generator.
    let self = this;
    return function*() {
      for (let element of self.elementRegistry.getOrderedElements()) {
        yield element;
        if (element.getAllElementsRecursive) {
          yield* element.getAllElementsRecursive();
        }
      }
    }();
  }}

module.exports = Collection;
