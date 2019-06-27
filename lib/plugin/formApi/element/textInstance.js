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
          value: this.context.post[this.formInstance.id] && (this.context.post[this.formInstance.id][this.name] != undefined)
            ? this.context.post[this.formInstance.id][this.name]
            : this.data.defaultValue
              ? this.data.defaultValue
              : '',
        },
      },
      thisClosing: true,
    });
    if (this.data.required) {
      text.data.attributes.required = undefined;
    }
    this.addInstance(text);
    this.wrap = TagPair.newInstance(this.context, {
      data: {
        tag: 'div',
        attributes: {
          class: new Set(['form-text', text.name]),
        },
      },
    });

    // Determine whether or not this element is in an error state.
    if (this.context.formApiErrorList.formId && this.context.formApiErrorList.formId.has(this.name)) {
      this.wrap.data.attributes.class.add('error');
    }

    await super.init(data);
  }
}

module.exports = TextInstance;
