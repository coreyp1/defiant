"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');

class Fieldset extends Element {
  init(context) {
    let theme = context.theme,
        TagPair = theme.getRenderable('TagPair'),
        legend = new TagPair(merge({
          tag: 'legend',
          attributes: {
            class: [this.name],
          },
          content: (typeof this.data.legend == 'object') ? this.data.legend.content : this.data.legend
        }, typeof this.data.legend == 'object' ? this.data.legend : {}));
    legend.name = this.name;
    legend.weight = -999;
    this.addElement(legend);
    this.wrap = new TagPair({
      tag: 'fieldset',
      attributes: {
        class: ['form-fieldset', legend.name],
      },
    });
    return super.init(context);
  }
}

module.exports = Fieldset;
