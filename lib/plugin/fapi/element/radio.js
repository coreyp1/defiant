"use strict";

const Element = require('./element');

class Radio extends Element {
  init(context) {
    let theme = context.theme,
        TagSingle = theme.getRenderable('TagSingle'),
        TagPair = theme.getRenderable('TagPair');

    for (let name of Object.keys(this.data.radios || {})) {
      // Create the Checkbox.
      let radioName = `${this.name}-${name}`,
          radio = new TagSingle({
            tag: 'input',
            attributes: {
              type: 'radio',
              name: `${this.name}[]`,
              id: [radioName],
              value: name,
            },
          });
      radio.name = radioName;
      if (context.post[this.form.name][this.name] && context.post[this.form.name][this.name][name]) {
        radio.data.attributes.checked = undefined;
      }
      // Create the Label.
      let label = new TagPair({
        tag: 'label',
        attributes: {
          for: radioName,
        },
        content: this.data.radios[name],
      });
      label.name = `${this.name}-${name}-label`;
      // Add them to the form.
      this.addElement(radio).addElement(label);
    }
    return super.init(context);
  }
}

module.exports = Radio;
