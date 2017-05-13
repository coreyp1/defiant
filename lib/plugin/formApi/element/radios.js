"use strict";

const Element = require('./element');

class Radios extends Element {
  init(context) {
    let theme = context.theme,
        TagSingle = theme.getRenderable('TagSingle'),
        TagPair = theme.getRenderable('TagPair');

    for (let entry of (this.data.radios || [])) {
      // Create the Checkbox.
      let radioName = `${this.name}-${entry.value}`,
          radio = new TagSingle({
            tag: 'input',
            attributes: {
              type: 'radio',
              name: `${this.name}[]`,
              id: [radioName],
              value: entry.value,
            },
          });
      radio.name = radioName;
      if (context.post[this.form.name][this.name] && context.post[this.form.name][this.name][entry.value]) {
        radio.data.attributes.checked = undefined;
      }
      // Create the Label.
      let label = new TagPair({
        tag: 'label',
        attributes: {
          for: radioName,
        },
        content: entry.label,
      });
      label.name = `${this.name}-${entry.value}-label`;
      // Add them to the form, but wrapped.
      let wrap = new Element(radioName).addElement(radio).addElement(label);
      wrap.wrap = new TagPair({
        tag: 'div',
        attributes: {
          class: ['form-radio', radioName],
        }
      });
      this.addElement(wrap);
    }
    // Lastly, wrap all of the checkboxes.
    this.wrap = new TagPair({
      tag: 'div',
      attributes: {
        class: ['form-radios', this.name],
      }
    });
    return super.init(context);
  }
}

module.exports = Radios;