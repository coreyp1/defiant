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

  validate(context) {
    return Promise.resolve();
  }

  submit(context) {
    return Promise.resolve();
  }
}

module.exports = Element;
