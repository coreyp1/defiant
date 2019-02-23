"use strict";

const RenderableInstance = require('../../theme/renderable/renderableInstance');
const CollectionInstance = require('../../theme/renderable/collectionInstance');

class ElementInstance extends CollectionInstance {
  async init(data={}) {
    const TagPair = this.context.theme.getRenderable('TagPair');

    // Add a label, if required.
    if (this.data && this.data.label) {
      let label = TagPair.newInstance(this.context, {
        name: `label-${this.name}`,
        weight: -1,
        data: {
          tag: 'label',
          attributes: {
            for: this.name,
            class: new Set([this.name]),
          },
        },
      });
      label.data.content = this.data.label;
      this.addInstance(label);
    }

    // Add a description, if required.
    if (this.data && this.data.description) {
      let description = TagPair.newInstance(this.context, {
        name: `description-${this.name}`,
        weight: 1,
        data: {
          tag: 'div',
          attributes: {
            class: new Set(['description', this.name]),
          },
        },
      });
      description.data.content = this.data.description;
      this.addInstance(description);
    }
    await super.init(data);
  }

  async commit() {
    if (this.wrap && (this.wrap instanceof RenderableInstance)) {
      await this.wrap.init({content: await super.commit()});
      return await this.wrap.commit();
    }
    return await super.commit();
  }

  setFormInstance(form) {
    this.formInstance = form;
    this.instanceRegistry.getOrderedElements().map(e => ((e.form!== form) && (typeof e.setFormInstance == 'function')) ? e.setFormInstance(form) : null);
  }

  async validate() {
    // Set error if required field is empty.
    let thisValue = this.formInstance ? this.context.post[this.formInstance.id][this.name] : undefined;
    if (this.data.required && !thisValue) {
      // Set a general error message (that won't be repeated multiple times).
      // TODO: Translate.
      this.formInstance.setError('requiredFieldEmpty', 'Please fill in the required fields.');
      // Set an empty error message, to highlight the field in the theme.
      this.formInstance.setError(this.name, '');
    }

    // Process sub-elements.
    for (let element of this.instanceRegistry.getIterator()) {
      if (element.validate) {
        await element.validate();
      }
    }
  }

  async submit() {
    for (let element of this.instanceRegistry.getIterator()) {
      if (element.submit) {
        await element.submit();
      }
    }
  }
}

module.exports = ElementInstance;
