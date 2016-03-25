"use strict";

const Collection = require('../theme/renderable/collection');
const Registry = require('../../util/registry');
const merge = require('../../util/merge');
const crypto = require('crypto');
const uuid = require('node-uuid');
const {coroutine: co} = require('bluebird');

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
    let Fapi = context.engine.plugin.get('Fapi'),
        Static = Fapi.getElement('Static'),
        Encrypt = Fapi.getElement('Encrypt'),
        validate = new (Fapi.getElement('FormValidate'))('validate'),
        buildState = new Encrypt('buildState'),
        verifyIncluded = [],
        ivCounter = this.getNextIVCounter();

    return co(function*(self, superInit) {
      // Add buildState.
      self.addElement(buildState);
      buildState.weight = -989;
      data.buildState = {value: self.buildState, verifyIncluded: true};

      // Runs init for all elements.  The important thing in this step is that
      // it causes the cryptographic signing to happen for all encrypt and
      // static elements.
      yield superInit.call(self, context, data);

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
      validate.weight = -999;
      self.addElement(validate);
      data.validate = {
        encrypt,
        static: [self.name, self.ivBase],
        ivCounter,
      };
      yield validate.init(context, data.validate);
    })(this, super.init);
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
    return this.ivCounter++;
  }
}

Form.validate = new Registry();

module.exports = Form;
