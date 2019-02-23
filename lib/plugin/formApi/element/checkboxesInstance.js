"use strict";

const Element = require('./element');

class Checkboxes extends Element {
  async init(context, data={}) {
    data = await super.init(context, data);
    const Element = context.theme.getRenderable('Element');

    for (let entry of (data.data.checkboxes || [])) {
      // Create the Checkbox.
      const checkboxName = `${data.name}-${entry.value}`;
      let checkbox = {
        tag: 'input',
        type: 'TagSingle',
        name: checkboxName,
        attributes: {
          type: 'checkbox',
          name: `${data.name}[]`,
          id: [checkboxName],
          value: entry.value,
        },
      };
      if (context.post[data.formData.name][data.name] && context.post[data.formData.name][data.name][entry.value]) {
        checkbox.attributes.checked = undefined;
      }
      // Create the Label.
      let label = {
        type: 'Element',
        name: `${data.name}-${entry.value}-label`,
        wrap: {
          tag: 'label',
          type: 'TagPair',
          attributes: {
            for: checkboxName,
            id: [`label-${checkboxName}`],
          },
        },
      };
      Element.addElement(label, checkbox).addElement(label, {
        tag: 'span',
        type: 'TagPair',
        attributes: {
          class: 'label-text',
        },
        content: entry.label,
      });
      // Add them to the form, but wrapped.
      let checkboxContainer = {
        type: 'Element',
        name: checkboxName,
        wrap: {
          tag: 'div',
          type: 'TagPair',
          attributes: {
            class: ['form-checkbox', checkboxName],
          },
        },
      };
      Element.addElement(checkboxContainer, label);
      this.addElement(data, checkboxContainer);
    }
    // Lastly, wrap all of the checkboxes.
    data.wrap = {
      tag: 'div',
      type: 'TagPair',
      attributes: {
        class: ['form-checkboxes', data.name],
      }
    };
    return data;
  }
}

module.exports = Checkboxes;
