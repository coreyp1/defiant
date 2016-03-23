"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');

class Button extends Element {
  commit() {
    let renderable = new (this.context.theme.getRenderable('TagPair'))(this.context);
    this.data = merge({
      tag: 'button',
      tag_type: 'submit',
      attributes: {
        value: this.name
      },
      content: this.name,
    }, this.data);
    return renderable.templateFunction(this.data);
  }
}

Button.template = 'TagPair';

module.exports = Button;
