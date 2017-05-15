"use strict";

const Collection = require('../../theme/renderable/collection');
const Registry = require('../../../util/registry');
const merge = require('../../../util/merge');
const {coroutine: co} = require('bluebird');

class Element extends Collection {
  constructor(name, data) {
    super(data);
    this.name = name;
    this.elements = new Registry({useId: 'name'});
  }

  init(context) {
    let theme = context.theme;

    // Add a label, if required.
    if (this.data.label) {
      let label = new (theme.getRenderable('TagPair'))(merge({
        tag: 'label',
        attributes: {
          for: this.name,
          class: [this.name],
        },
      }, typeof this.data.label == 'string' ? {content: this.data.label} : this.data.label));
      label.name = 'label-' + this.name;
      label.weight = -1;
      this.addElement(label);
    }

    // Add a description, if required.
    if (this.data.description) {
      let description = new (theme.getRenderable('TagPair'))(merge({
        tag: 'div',
        attributes: {
          class: ['description', this.name],
        },
      }, typeof this.data.description == 'string' ? {content: this.data.description} : this.data.description));
      description.name = 'description-' + this.name;
      description.weight = 1;
      this.addElement(description);
    }

    return super.init(context);
  }

  commit() {
    if (this.wrap && this.wrap.data) {
      this.wrap.data.content = super.commit();
      return this.wrap.commit();
    }
    return super.commit();
  }

  setForm(form) {
    this.form = form;
    this.elements.getOrderedElements().map(e => ((e.form !== form) && e.setForm) ? e.setForm(form) : null);
  }

  validate(context) {
    return co(function*(self){
      // Set error if required field is empty.
      let thisValue = self.form ? context.post[self.form.name][self.name] : undefined;
      if (self.data.required && !thisValue) {
        // Set a general error message (that won't be repeated multiple times).
        // TODO: Translate.
        self.form.setError(context, 'requiredFieldEmpty', 'Please fill in the required fields.');
        // Set an empty error message, to highlight the field in the theme.
        self.form.setError(context, self.name, '');
      }

      // Process sub-elements.
      for (let element of self.elements.getIterator()) {
        if (element.validate) {
          yield element.validate(context);
        }
      }
    })(this);
  }

  submit(context) {
    return co(function*(self){
      for (let element of self.elements.getIterator()) {
        if (element.submit) {
          yield element.submit(context);
        }
      }
    })(this);
  }
}

module.exports = Element;
