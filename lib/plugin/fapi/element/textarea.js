"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');

class Textarea extends Element {
  init(context) {
    let theme = context.theme,
        TagPair = theme.getRenderable('TagPair'),
        textarea = new TagPair(merge({
          tag: 'textarea',
          attributes: {
            name: this.name,
          },
          content: context.post[this.form.name][this.name] != undefined ? context.post[this.form.name][this.name] : this.data.defaultValue ? this.data.defaultValue : '',
        }, this.data));
        textarea.name = this.name;
    this.addElement(textarea);
    this.wrap = new TagPair({
      tag: 'div',
      attributes: {
        class: ['form-textarea', textarea.name],
      }
    });
    return super.init(context);
  }
}

module.exports = Textarea;
