"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');

class Select extends Element {
  async init(context) {
    let theme = context.theme,
        TagPair = theme.getRenderable('TagPair'),
        self = this,
        counter = 0; // Used to prevent duplicate (interior) names.

    // Helper function to recursively add options and option groups.
    function addOptions(obj, data=[]) {
      for (let option of data) {
        if (option.optgroup) {
          // Add an option group.
          let optGroup = new Element(self.name + (counter++));
          optGroup.wrap = new TagPair({
            tag: 'optgroup',
            attributes: {
              label: option.optgroup
            },
          });

          // Recursively add the element for this option group.
          addOptions(optGroup, option.options);
          obj.addElement(optGroup);
        }
        else {
          // Add an option.
          let o = new TagPair({
            tag: 'option',
            attributes: {value: option.value},
            content: option.label,
          });
          if (defaultValues[option.value]) {
            o.data.attributes.selected = undefined;
          }
          o.name = self.name + (counter++);
          obj.addElement(o);
        }
      }
    }

    // Create the Select as a wrapper into which child element will be added.
    let select = new Element(`${this.name}[]`);
    select.wrap = new TagPair(merge({
      tag: 'select',
      attributes: {
        name: `${this.name}[]`,
        class: [this.name],
      },
    }, this.data));
    this.addElement(select);

    // Determine the default values.
    let defaultValues = {};
    if (context.post[this.form.name] && context.post[this.form.name][this.name]) {
      // There is a post value.  Use this for the default.
      for (let key in context.post[this.form.name][this.name]) {
        defaultValues[key] = true;
      }
    }
    else {
      // There is not a post value.  Use the declared defaults.
      for (let key of this.data.defaultValues || []) {
        defaultValues[key] = true;
      }
    }

    // Add the options and option groups.
    addOptions(select, this.data.options)
    // Lastly, wrap everything.
    this.wrap = new TagPair({
      tag: 'div',
      attributes: {
        class: ['form-select', this.name],
      }
    });
    return super.init(context);
  }
}

module.exports = Select;
