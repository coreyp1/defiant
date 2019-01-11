"use strict";

const Element = require('./element');

class GenericRenderable extends Element {
  constructor(name, renderable) {
    super(name, {});
    this.name = name;
    this.renderable = renderable;
  }

  async init(context) {
    await super.init(context);
    await this.renderable.init(context);
  }

  commit() {
    return this.renderable.commit() + super.commit();
  }
}

module.exports = GenericRenderable;