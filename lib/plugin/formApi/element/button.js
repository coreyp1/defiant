"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');

class Button extends Element {
  init(context) {
    let renderable = new (context.theme.getRenderable('TagPair'))(merge({
      tag: 'button',
      attributes: {
        value: this.data.value,
        name: this.name,
      },
      content: this.name,
    }, this.data));
    renderable.name = this.name
    this.addElement(renderable);
    return super.init(context);
  }
}

Button.template = 'TagPair';

module.exports = Button;
