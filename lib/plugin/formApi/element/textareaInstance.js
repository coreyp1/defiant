"use strict";

const ElementInstance = require('./elementInstance');

class TextareaInstance extends ElementInstance {
  async init(data={}) {
    const TagPair = this.context.theme.getRenderable('TagPair');
    this.addInstance(TagPair.newInstance(this.context, {
      name: this.name,
      data:{
        tag: 'textarea',
        attributes: {
          name: this.name,
        },
        content: this.context.post[this.formInstance.id] && (this.context.post[this.formInstance.id][this.name] != undefined)
          ? this.context.post[this.formInstance.id][this.name]
          : this.data.defaultValue
            ? this.data.defaultValue
            : '',
      },
    }));
    data.wrap = TagPair.newInstance(this.context, {
      data: {
        tag: 'div',
        attributes: {
          class: new Set(['form-textarea', this.name]),
        }
      },
    });
    await super.init(data);
  }
}

module.exports = TextareaInstance;
