"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');

class Select extends Element {
  init(context) {
    let theme = context.theme,
        TagSingle = theme.getRenderable('TagSingle'),
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
            }
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
          if (context.post[self.form.name] && context.post[self.form.name][self.name] && context.post[self.form.name][self.name][option.value]) {
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
