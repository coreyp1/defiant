"use strict";

const clone = require('clone');
const merge = require('../../../util/merge');

class RenderableInstance {
  constructor(renderable, setup, context) {
    this.renderable = renderable;
    ['id', 'name', 'weight'].map(key => this[key] = setup[key] ? setup[key] : this.constructor[key]);
    this.data = clone(setup.data || {});
    this.context = context;
  }

  async init(data={}) {
    this.data = merge(this.data, data);
  }

  async commit() {
    return this.renderable.templateFunction(this.data);
  }
}

module.exports = RenderableInstance;
