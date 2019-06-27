"use strict";

const ElementInstance = require('./elementInstance');
const he = require('he');

class HiddenInstance extends ElementInstance {
  async init(data={}) {
    await super.init(data);
    const TagSingle = this.context.theme.getRenderable('TagSingle');
    let renderable = TagSingle.newInstance(this.context, {
      name: this.name,
      data: {
        tag: 'input',
        attributes: {
          type: 'hidden',
          name: this.name,
          value: he.escape(
            this.data.value
            ? this.data.value
            : this.context.post[this.formInstance.id] && (this.context.post[this.formInstance.id][this.name] != undefined)
              ? this.context.post[this.formInstance.id][this.name]
              : this.data.defaultValue
                ? this.data.defaultValue
                : ''),
        },
      },
    });
    this.addInstance(renderable);
  }
}

module.exports = HiddenInstance;
