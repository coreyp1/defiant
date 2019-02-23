"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');

class Select extends Element {
  async init(context, data={}) {
    data = await super.init(context, data);

    // Use `name` in addOptions().
    // The only reason is to keep eslint from complaining.
    let name = data.name;

    const Element = context.theme.getRenderable('Element');
    let counter = 0; // Used to prevent duplicate (interior) names.

    // Helper function to recursively add options and option groups.
    function addOptions(obj, dataOptions=[]) {
      for (let option of dataOptions) {
        if (option.optgroup) {
          // Add an option group.
          let optGroup = {
            type: 'Element',
            name: name + (counter++),
            wrap: {
              tag: 'optgroup',
              type: 'TagPair',
              attributes: {
                label: option.optgroup,
              }
            }
          };

          // Recursively add the element for this option group.
          addOptions(optGroup, option.options);
          Element.addElement(obj, optGroup);
        }
        else {
          // Add an option.
          let o = {
            tag: 'option',
            type: 'TagPair',
            name: name + (counter++),
            attributes: {
              value: option.value
            },
            content: option.label,
          };
          if (defaultValues[option.value]) {
            o.attributes.selected = undefined;
          }
          Element.addElement(obj, o);
        }
      }
    }

    // Create the Select as a wrapper into which child element will be added.
    let select = {
      type: 'Element',
      name: `${data.name}[]`,
      wrap: {
        tag: 'select',
        type: 'TagPair',
        attributes: {
          name: `${data.name}[]`,
          class: [data.name],
        },
      },
    };
    this.addElement(data, select);

    // Determine the default values.
    let defaultValues = {};
    if (context.post[data.formData.name] && context.post[data.formData.name][data.name]) {
      // There is a post value.  Use this for the default.
      for (let key in context.post[data.formData.name][data.name]) {
        defaultValues[key] = true;
      }
    }
    else {
      // There is not a post value.  Use the declared defaults.
      for (let key of data.data.defaultValues || []) {
        defaultValues[key] = true;
      }
    }

    // Add the options and option groups.
    addOptions(select, data.data.options)
    // Lastly, wrap everything.
    data.wrap = {
      tag: 'div',
      type: 'TagPair',
      attributes: {
        class: ['form-select', data.name],
      },
    };
    return data;
  }
}

module.exports = Select;
