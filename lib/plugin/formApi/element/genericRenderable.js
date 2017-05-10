"use strict";

const Element = require('./element');
const {coroutine: co} = require('bluebird');

class GenericRenderable extends Element {
  constructor(name, renderable) {
    super(name, {});
    this.name = name;
    this.renderable = renderable;
  }

  init(context) {
    return co(function*(self, superInit){
      yield superInit.call(self, context);
      yield self.renderable.init(context);
    })(this, super.init);
  }

  commit() {
    return this.renderable.commit() + super.commit();
  }
}

module.exports = GenericRenderable;