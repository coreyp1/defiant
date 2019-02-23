"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');

class Textarea extends Element {
  async init(context, data={}) {
    data = await super.init(context, data);
    let textarea = {
      tag: 'textarea',
      type: 'TagPair',
      name: data.name,
      attributes: {
        name: data.name,
      },
      content: context.post[data.formData.name][data.name] != undefined ? context.post[data.formData.name][data.name] : data.data.defaultValue ? data.data.defaultValue : '',
    };
    this.addElement(textarea);
    data.wrap = {
      tag: 'div',
      type: 'TagPair',
      attributes: {
        class: ['form-textarea', textarea.name],
      }
    };
    return data;
  }
}

module.exports = Textarea;
