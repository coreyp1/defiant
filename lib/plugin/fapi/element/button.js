"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');

class Button extends Element {
  init(context, data) {
    data = data || {};
    let renderable = new (context.theme.getRenderable('TagPair'))();
    renderable.name = this.name
    data[this.name] = merge({
      tag: 'button',
      attributes: {
        value: data.value,
        name: this.name,
      },
      content: this.name,
    }, data);
    this.addElement(renderable);
    return super.init(context, data);
  }
}

Button.template = 'TagPair';

module.exports = Button;
