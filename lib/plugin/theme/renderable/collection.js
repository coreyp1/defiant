"use strict";

const Renderable = require('./renderable');
const Registry = require('../../../util/registry');
const {coroutine: co} = require('bluebird');

class Collection extends Renderable {
  constructor() {
    super();
    this.elements = new Registry();
  }

  addElement(element) {
    this.elements.set(element);
    element.parent = this;
    return this;
  }

  init(context, data) {
    data = data || {};
    super.init(context, data);
    let elements = this.elements.getOrderedElements();
    return co(function*() {
      for (let element of elements) {
        yield element.init(context, data[element.name]);
      }
    })();
  }

  commit() {
    return this.elements.getOrderedElements().map(item => item.commit()).join('');
  }
}

module.exports = Collection;
