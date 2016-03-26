"use strict";

const Element = require('./element');

class Checkboxes extends Element {
  init(context) {
    let theme = context.theme,
        TagSingle = theme.getRenderable('TagSingle'),
        TagPair = theme.getRenderable('TagPair');

    for (let name of Object.keys(this.data.checkboxes || {})) {
      // Create the Checkbox.
      let checkboxName = `${this.name}-${name}`,
          checkbox = new TagSingle({
            tag: 'input',
            attributes: {
              type: 'checkbox',
              name: `${this.name}[]`,
              id: [checkboxName],
              value: name,
            },
          });
      checkbox.name = checkboxName;
      if (context.post[this.form.name][this.name] && context.post[this.form.name][this.name][name]) {
        checkbox.data.attributes.checked = undefined;
      }
      // Create the Label.
      let label = new TagPair({
        tag: 'label',
        attributes: {
          for: checkboxName,
        },
        content: this.data.checkboxes[name],
      });
      label.name = `${this.name}-${name}-label`;
      // Add them to the form.
      this.addElement(checkbox).addElement(label);
    }
    return super.init(context);
  }
}

module.exports = Checkboxes;
