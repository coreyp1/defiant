"use strict";

const ElementInstance = require('./elementInstance');

class PasswordInstance extends ElementInstance {
  async init(context, data={}) {
    const TagSingle = this.context.theme.getRenderable('TagSingle');
    const TagPair = this.context.theme.getRenderable('TagPair');
    let password = TagSingle.newInstance(this.context, {
      name: this.name,
      data: {
        tag: 'input',
        attributes: {
          type: 'password',
          name: this.name,
          value: '',
        },
      },
      thisClosing: true,
    });
    this.addInstance(password);
    this.wrap = TagPair.newInstance(this.context, {
      data: {
        tag: 'div',
        attributes: {
          class: new Set(['form-password', password.name]),
        },
      },
    });
    super.init(data);
  }
}

module.exports = PasswordInstance;
