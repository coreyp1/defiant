"use strict";

const Collection = require('../theme/renderable/collection');
const Registry = require('../../util/registry');
const merge = require('../../util/merge');
const crypto = require('crypto');
const uuid = require('node-uuid');
const {coroutine: co} = require('bluebird');

class Form extends Collection {
  constructor(buildState, ivBase) {
    super();
    this.form = this;
    this.name = this.constructor.name;
    this.elementRegistry = new Registry({useId: 'name'});
    this.buildState = buildState || {};
    this.ivCounter = 0;
    this.ivBase = ivBase || uuid.v4();
  }

  init(context) {
    let FormApi = context.engine.pluginRegistry.get('FormApi'),
        Static = FormApi.getElement('Static'),
        Encrypt = FormApi.getElement('Encrypt'),
        verifyIncluded = [],
        ivCounter = this.getNextIVCounter();

    // Determine the post information.
    context.post[this.name] = context.post[this.name] || {};
    // Remove unnecessary information, if present.
    delete this.buildState.validate;
    delete this.buildState.buildState;

    return co(function*(self, superInit) {
      // Add buildState.
      let buildState = new Encrypt('buildState', {value: self.buildState, verifyIncluded: true});
      buildState.weight = -989;
      self.addElement(buildState);

      // Runs init for all elements.  The important thing in this step is that
      // it causes the cryptographic signing to happen for all encrypt and
      // static elements.
      yield superInit.call(self, context);

      // Compile the data from encrypt and static element for inclusion in the
      // validate element.
      let encrypt = {e: {}, v: []};
      for (let element of self.getAllElementsRecursive()) {
        if (element.name && ((element instanceof Encrypt) || (element instanceof Static))) {
          encrypt.e[element.name] = {c: element.ivCounter, t: element.encrypted.tag};
        }
        if (element.data && element.data.verifyIncluded) {
          encrypt.v.push(element.name);
        }
      }

      // Finally, add the validate element, and call its init (which was left
      // out of the superInit).
      let validate = new (FormApi.getElement('FormValidate'))('validate', {
        encrypt,
        static: [self.name, self.ivBase],
        ivCounter,
      });
      validate.weight = -999;
      self.addElement(validate);
      yield validate.init(context);
    })(this, super.init);
  }

  commit() {
    let renderable = new (this.context.theme.getRenderable('TagPair'))(merge({
      tag: 'form',
      attributes: {
        method: 'post',
        action: '',
        enctype: 'multipart/form-data',
        'accept-charset': 'UTF-8',
        autocomplete: 'on', //HTML 5
        name: this.name,
        id: [this.name],
        novalidate: false, //HTML 5 - 'novalidate'
      },
      content: super.commit(),
    }, this.data));
    return renderable.templateFunction();
  }

  validate(context) {
    // In the event of an error, set context.formApiError = true;
    return co(function*(self){
      for (let element of self.elementRegistry.getIterator()) {
        if (element.validate) {
          yield element.validate(context);
        }
      }
    })(this);
  }

  submit(context) {
    return co(function*(self){
      for (let element of self.elementRegistry.getIterator()) {
        if (element.submit) {
          yield element.submit(context);
        }
      }
    })(this);
  }

  setError(context, elementName, message) {
    this.validationError = true;
    context.engine.pluginRegistry.get('FormApi').setError(context, this.name, elementName, message);
  }

  addElement(element) {
    if (element.setForm) {
      element.setForm(this);
    }
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
    return this.ivCounter++;
  }
}

// NOTE: By default, these will be instantiated as a new Registry() when a
// form is registered with the FormApi plugin.
Form.validateRegistry = undefined;
Form.submitRegistry = undefined;

module.exports = Form;
