"use strict";

const Element = require('./element');

class GenericRenderable extends Element {
  commit(data) {
    let Renderable = data.context.theme.getRenderable(data.type);
    return (Renderable && Renderable.commit)
      ? (Renderable.commit(data.data) + super.commit(data))
      : '';
  }
}

module.exports = GenericRenderable;
