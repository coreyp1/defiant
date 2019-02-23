"use strict";

const ElementInstance = require('./elementInstance');

class ButtonInstance extends ElementInstance {
  async init(data={}) {
    const TagPair = this.context.theme.getRenderable('TagPair');
    let button = TagPair.newInstance(this.context, {
      name: this.name,
      data: {
        tag: 'button',
        attributes: {
          value: this.data.value,
          name: this.name,
          class: new Set(['btn']),
        },
        content: this.name,
      },
    });
    this.addInstance(button);
    await super.init(data);
  }
}

module.exports = ButtonInstance;
