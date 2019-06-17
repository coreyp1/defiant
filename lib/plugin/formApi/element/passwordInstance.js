"use strict";

const ElementInstance = require('./elementInstance');

class PasswordInstance extends ElementInstance {
  async init(data={}) {
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
    if (this.data.required) {
      password.data.attributes.required = undefined;
    }
    this.addInstance(password);
    this.wrap = TagPair.newInstance(this.context, {
      data: {
        tag: 'div',
        attributes: {
          class: new Set(['form-password', password.name]),
        },
      },
    });

    // Determine whether or not this element is in an error state.
    if (this.context.formApiErrorList.formId && this.context.formApiErrorList.formId.has(this.name)) {
      this.wrap.data.attributes.class.add('error');
    }

    super.init(data);
  }
}

module.exports = PasswordInstance;
