"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');

class File extends Element {
  init(context) {
    let theme = context.theme,
        TagSingle = theme.getRenderable('TagSingle'),
        TagPair = theme.getRenderable('TagPair'),
        text = new TagSingle(merge({
          tag: 'input',
          attributes: {
            type: 'file',
            name: this.name,
            value: context.post[this.form.name][this.name] != undefined ? context.post[this.form.name][this.name] : this.data.defaultValue ? this.data.defaultValue : '',
          },
          selfClosing: true,
        }, this.data));
    text.name = this.name;
    this.addElement(text);
    this.wrap = new TagPair({
      tag: 'div',
      attributes: {
        class: ['form-text', text.name],
      }
    });
    return super.init(context);
  }
}

module.exports = File;
