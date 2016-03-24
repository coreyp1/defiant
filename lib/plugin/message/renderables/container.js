"use strict";

const TagPair = require('../../fapi/renderable/tagPair');
const Registry = require('../../../util/registry');

class Container extends TagPair {
  constructor(context) {
    super();
    this.context = context;
    this.message = {};
  }

  set(id, content, type = 'default') {
    if (typeof this.message[type] === 'undefined') {
      this.message[type] = new Registry();
    }
    this.message[type].set({id, content});
    return this;
  };
}

module.exports = Container;
