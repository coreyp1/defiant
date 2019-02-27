"use strict";

const ElementInstance = require('./elementInstance');

class FieldsetInstance extends ElementInstance {
  async init(data={}) {
    const TagPair = this.context.theme.getRenderable('TagPair');
    this.addInstance(TagPair.newInstance(this.context, {
      name: this.name,
      weight: -999,
      data: {
        tag: 'legend',
        attributes: {
          class: new Set([this.name]),
        },
        content: data.legend || this.data.legend || '',
      },
    }));
    this.wrap = TagPair.newInstance(this.context, {
      name: this.name,
      data: {
        tag: 'fieldset',
        attributes: {
          class: new Set(['form-fieldset', this.name]),
        },
      },
    });
    await super.init(data);
  }
}

module.exports = FieldsetInstance;
