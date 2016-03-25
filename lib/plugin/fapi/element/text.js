"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');

class Text extends Element {
  init(context, data) {
    data = data || {};
    let theme = context.theme,
        TagSingle = theme.getRenderable('TagSingle'),
        text = new TagSingle();
    text.name = this.name;
    data[this.name] = merge({
      tag: 'input',
      attributes: {
        type: 'text',
        name: this.name,
        value: context.post[this.form.name][this.name] != undefined ? context.post[this.form.name][this.name] : data.defaultValue ? data.defaultValue : '',
      },
      selfClosing: true,
    }, data);
    this.addElement(text);
    return super.init(context, data);
  }
}

module.exports = Text;
