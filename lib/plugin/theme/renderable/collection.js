"use strict";

const Renderable = require('./renderable');
const Registry = require('../../../util/registry');
const merge = require('../../../util/merge');

class Collection extends Renderable {
  constructor(engine, data) {
    super(engine, data);
    this.elementRegistry = new Registry();
  }

  addElement(element) {
    this.elementRegistry.set(element);
    element.parent = this;
    return this;
  }

  async init(context, data={}) {
    let thisdata = {};
    for (let element of this.elementRegistry.getOrderedElements()) {
      thisdata[element.id] = await element.init(context);
    }
    return await super.init(context, merge(thisdata, data));
  }

  commit(data) {
    return this.elementRegistry.getOrderedElements()
      .map(item => item.commit(data[item.id]))
      .join('');
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
