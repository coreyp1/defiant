"use strict";

const Collection = require('../theme/renderable/collection');
const Registry = require('../../util/registry');
const merge = require('../../util/merge');
const crypto = require('crypto');
const uuid = require('node-uuid');

class Form extends Collection {
  constructor(data={}, buildState={}, ivBase=uuid.v4()) {
    super();
    this.form = this;
    this.name = this.constructor.name;
    this.elements = new Registry({useId: 'name'});
    this.buildState = buildState;
    this.ivCounter = 0;
    this.ivBase = ivBase;
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

  addElement(element) {
    element.form = this.form;
    return super.addElement(element);
  }

  hash(plaintext) {
    let shasum = crypto.createHash('sha256');
    shasum.update(plaintext);
    return shasum.digest('base64');
  }

  getIV(slug) {
    return this.hash(this.ivBase + slug.toString()).substring(0,12);
  }

  getNextIVCounter() {
    return ++this.ivCounter;
  }
}

Form.validate = new Registry();

module.exports = Form;
