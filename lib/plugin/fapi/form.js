"use strict";

const Collection = require('../theme/renderable/collection');
const merge = require('../../util/merge');

class Form extends Collection {
  constructor() {
    super();
    this.name = this.constructor.name;
  }
  init(context, data) {
    return super.init(context, data);
  }
  commit() {
    let renderable = new (this.context.theme.getRenderable('TagPair'))(this.context);
    this.data = merge({
      tag: 'form',
      attributes: {
        method: 'post',
        action: '',
        enctype: 'multipart/form-data',
        'accept-charset': 'UTF-8',
        autocomplete: 'on', //HTML 5
        name: '',
        novalidate: false, //HTML 5 - 'novalidate'
      },
      content: super.commit(),
    }, this.data);
    return renderable.templateFunction(this.data);
  }
}

module.exports = Form;
