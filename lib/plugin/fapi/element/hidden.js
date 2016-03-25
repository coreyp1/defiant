"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');
const he = require('he');

class Hidden extends Element {
  init(context, data) {
    data = data || {};
    let renderable = new (context.theme.getRenderable('TagSingle'))();
    renderable.name = this.name
    data[this.name] = merge({
      tag: 'input',
      attributes: {
        type: 'hidden',
        name: this.name,
        value: he.escape(data.value),
      },
    }, data);
    this.addElement(renderable);
    return super.init(context, data);
  }
}

module.exports = Hidden;
