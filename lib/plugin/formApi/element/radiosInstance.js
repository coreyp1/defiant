"use strict";

const Element = require('./element');

class Radios extends Element {
  async init(context, data={}) {
    data = await super.init(context, data);
    const Element = context.theme.getRenderable('Element');

    for (let entry of (data.data.radios || [])) {
      // Create the Checkbox.
      const radioName = `${data.name}-${entry.value}`;
      let radio = {
        tag: 'input',
        type: 'TagSingle',
        name: radioName,
        attributes: {
          type: 'radio',
          name: `${data.name}[]`,
          id: [radioName],
          value: entry.value,
        },
      };
      if (context.post[data.formData.name][data.name] && context.post[data.formData.name][data.name][entry.value]) {
        radio.attributes.checked = undefined;
      }
      // Create the Label.
      let label = {
        type: 'Element',
        name: `${data.name}-${entry.value}-label`,
        wrap: {
          tag: 'label',
          type: 'TagPair',
          attributes: {
            for: radioName,
          },
        },
      };
      Element.addElement(label, radio).addElement(label, {
        tag: 'span',
        type: 'TagPair',
        attributes: {
          class: 'label-text',
        },
        content: entry.label,
      });
      // Add them to the form, but wrapped.
      let radioContainer = {
        type: 'Element',
        name: radioName,
        wrap: {
          tag: 'div',
          type: 'TagPair',
          attributes: {
            class: ['form-radio', radioName],
          },
        }
      };
      Element.addElement(radioContainer, label);
      this.addElement(data, radioContainer);
    }
    // Lastly, wrap all of the checkboxes.
    data.wrap = {
      tag: 'div',
      type: 'TagPair',
      attributes: {
        class: ['form-radios', data.name],
      }
    };
    return data;
  }
}

module.exports = Radios;
