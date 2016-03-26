"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');

class Text extends Element {
  init(context) {
    let theme = context.theme,
        TagSingle = theme.getRenderable('TagSingle'),
        text = new TagSingle(merge({
          tag: 'input',
          attributes: {
            type: 'text',
            name: this.name,
            value: context.post[this.form.name][this.name] != undefined ? context.post[this.form.name][this.name] : this.data.defaultValue ? this.data.defaultValue : '',
          },
          selfClosing: true,
        }, this.data));
    text.name = this.name;
    this.addElement(text);
    return super.init(context, this.data);
  }
}

module.exports = Text;
