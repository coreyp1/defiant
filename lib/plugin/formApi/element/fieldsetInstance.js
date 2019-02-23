"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');

class Fieldset extends Element {
  async init(context, data={}) {
    data = await super.init(context, data);
    let legend = merge({
      tag: 'legend',
      type: 'TagPair',
      name: data.name,
      weight: -999,
      attributes: {
        class: [data.name],
      },
      content: (typeof data.data.legend == 'object') ? data.data.legend.content : data.data.legend,
    }, typeof data.data.legend == 'object' ? data.data.legend : {});
    this.addElement(data, legend);
    data.wrap = {
      tag: 'fieldset',
      type: 'TagPair',
      attributes: {
        class: ['form-fieldset', legend.name],
      },
    };
    return data;
  }
}

module.exports = Fieldset;
