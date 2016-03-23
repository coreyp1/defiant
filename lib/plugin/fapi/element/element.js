"use strict";

const Collection = require('../../theme/renderable/collection');
const Registry = require('../../../util/registry');
const merge = require('../../../util/merge');
const {coroutine: co} = require('bluebird');

class Element extends Collection {
  constructor(name) {
    super();
    this.name = name;
    this.elements = new Registry({useId: 'name'});
  }

  init(context, data) {
    data = data || {};
    let theme = context.theme;

    // Add a label, if required.
    if (data.label) {
      let label = new (theme.getRenderable('TagPair'))();
      label.name = 'label-' + this.name;
      label.weight = -1;
      data[label.name] = merge({
        tag: 'label',
        attributes: {
          for: this.name,
          class: [this.name],
        },
      }, data.label);
      this.addElement(label);
    }

    // Add a description, if required.
    if (data.description) {
      let description = new (theme.getRenderable('TagPair'))();
      description.name = 'description-' + this.name;
      description.weight = 1;
      data[description.name] = merge({
        tag: 'div',
        attributes: {
          class: ['description', this.name],
        },
      }, data.description);
      this.addElement(description);
    }
    return super.init(context, data);
  }
}

module.exports = Element;
