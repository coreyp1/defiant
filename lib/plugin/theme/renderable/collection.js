"use strict";

const Renderable = require('./renderable');
const Registry = require('../../../util/registry');
const {coroutine: co} = require('bluebird');

class Collection extends Renderable {
  constructor(data) {
    super(data);
    this.elements = new Registry();
  }

  addElement(element) {
    this.elements.set(element);
    element.parent = this;
    return this;
  }

  init(context, data) {
    return co(function*(self, superInit) {
      yield superInit.call(self, context, data);
      for (let element of self.elements.getOrderedElements()) {
        yield element.init(context);
      }
    })(this, super.init);
  }

  commit() {
    return this.elements.getOrderedElements().map(item => item.commit()).join('');
  }

  getAllElementsRecursive() {
    let self = this;
    return function*() {
      for (let element of self.elements.getOrderedElements()) {
        yield element;
        if (element.getAllElementsRecursive) {
          yield* element.getAllElementsRecursive();
        }
      }
    }();
  }
}

module.exports = Collection;
