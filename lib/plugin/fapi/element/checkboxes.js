"use strict";

const Element = require('./element');

class Checkboxes extends Element {
  init(context, data) {
    data = data || {};
    let theme = context.theme,
        TagSingle = theme.getRenderable('TagSingle'),
        TagPair = theme.getRenderable('TagPair'),
        checkbox,
        label;

    for (let name of Object.keys(data.checkboxes || {})) {
      // Create the Checkbox.
      checkbox = new TagSingle();
      checkbox.name = `${this.name}-${name}`;
      data[checkbox.name] = {
        tag: 'input',
        attributes: {
          type: 'checkbox',
          name: `${this.name}[]`,
          id: [checkbox.name],
          value: name,
        },
      };
      if (context.post[this.form.name][this.name] && context.post[this.form.name][this.name][name]) {
        data[checkbox.name].attributes.checked = undefined;
      }
      // Create the Label.
      label = new TagPair();
      label.name = `${this.name}-${name}-label`;
      data[label.name] = {
        tag: 'label',
        attributes: {
          for: checkbox.name,
        },
        content: data.checkboxes[name],
      };
      // Add them to the form.
      this.addElement(checkbox).addElement(label);
    }
    return super.init(context, data);
  }
}

module.exports = Checkboxes;
