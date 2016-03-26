"use strict";

const Element = require('./element');

class Checkboxes extends Element {
  init(context) {
    let theme = context.theme,
        TagSingle = theme.getRenderable('TagSingle'),
        TagPair = theme.getRenderable('TagPair');

    for (let entry of (this.data.checkboxes || [])) {
      // Create the Checkbox.
      let checkboxName = `${this.name}-${entry.value}`,
          checkbox = new TagSingle({
            tag: 'input',
            attributes: {
              type: 'checkbox',
              name: `${this.name}[]`,
              id: [checkboxName],
              value: entry.value,
            },
          });
      checkbox.name = checkboxName;
      if (context.post[this.form.name][this.name] && context.post[this.form.name][this.name][entry.value]) {
        checkbox.data.attributes.checked = undefined;
      }
      // Create the Label.
      let label = new TagPair({
        tag: 'label',
        attributes: {
          for: checkboxName,
        },
        content: entry.label,
      });
      label.name = `${this.name}-${entry.value}-label`;
      // Add them to the form, but wrapped.
      let wrap = new Element(checkboxName).addElement(checkbox).addElement(label);
      wrap.wrap = new TagPair({
        tag: 'div',
        attributes: {
          class: ['form-checkbox', checkboxName],
        }
      });
      this.addElement(wrap);
    }
    // Lastly, wrap all of the checkboxes.
    this.wrap = new TagPair({
      tag: 'div',
      attributes: {
        class: ['form-checkboxes', this.name],
      }
    });
    return super.init(context);
  }
}

module.exports = Checkboxes;
