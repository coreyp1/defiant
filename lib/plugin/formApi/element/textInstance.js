"use strict";

const ElementInstance = require('./elementInstance');

class TextInstance extends ElementInstance {
  async init(data={}) {
    const TagSingle = this.context.theme.getRenderable('TagSingle');
    const TagPair = this.context.theme.getRenderable('TagPair');
    let text = TagSingle.newInstance(this.context, {
      name: this.name,
      data: {
        tag: 'input',
        attributes: {
          type: 'text',
          name: this.name,
          value: this.context.post[this.formInstance.name][this.name] != undefined ? this.context.post[this.formInstance.name][this.name] : this.data.defaultValue ? this.data.defaultValue : '',
        },
      },
      thisClosing: true,
    });
    this.addInstance(text);
    this.wrap = TagPair.newInstance(this.context, {
      data: {
        tag: 'div',
        type: 'TagPair',
        attributes: {
          class: new Set(['form-text', text.name]),
        },
      },
    });
    await super.init(data);
  }
}

module.exports = TextInstance;
