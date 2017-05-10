"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');
const he = require('he');

class Hidden extends Element {
  init(context) {
    let renderable = new (context.theme.getRenderable('TagSingle'))(merge({
      tag: 'input',
      attributes: {
        type: 'hidden',
        name: this.name,
        value: he.escape(this.data.value),
      },
    }, this.data));
    renderable.name = this.name
    this.addElement(renderable);
    return super.init(context);
  }
}

module.exports = Hidden;
