"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');

class Password extends Element {
  async init(context) {
    let theme = context.theme,
        TagSingle = theme.getRenderable('TagSingle'),
        TagPair = theme.getRenderable('TagPair'),
        password = new TagSingle(merge({
          tag: 'input',
          attributes: {
            type: 'password',
            name: this.name,
            value: '',
          },
          thisClosing: true,
        }, this.data));
        password.name = this.name;
    this.addElement(password);
    this.wrap = new TagPair({
      tag: 'div',
      attributes: {
        class: ['form-password', password.name],
      }
    });
    return super.init(context);
  }
}

module.exports = Password;
