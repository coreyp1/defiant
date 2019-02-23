"use strict";

const CollectionInstance = require('../theme/renderable/collectionInstance');
const crypto = require('crypto');
const uuid = require('node-uuid');

class FormInstance extends CollectionInstance {
  constructor(renderable, setup, context) {
    super(renderable, setup, context);
    this.id = this.id || this.renderable.id;

    // Set up default data members.
    this.buildState = setup.buildState || {};
    this.ivBase = setup.ivBase || uuid.v4();
    this.ivCounter = 0;
  }

  /**
   * Form init function (async).
   * In all Form derivatives, super.init() should be called LAST!
   * Otherwise, the Static and Encrypt elements will not work properly.
   */
  async init(data={}) {
    const FormApi = this.context.engine.pluginRegistry.get('FormApi');
    const Encrypt = FormApi.getElement('Encrypt');
    const Static = FormApi.getElement('Static');
    const FormValidate = FormApi.getElement('FormValidate');

    // Determine the post information.
    this.context.post[this.renderable.id] = this.context.post[this.renderable.id] || {};
    // Remove unnecessary information, if present.
    delete this.buildState.validate;
    delete this.buildState.buildState;

    // Add buildState.
    this.addInstance(Encrypt.newInstance(this.context, {
      name: 'buildState',
      weight: -989,
      data: {
        verifyIncluded: true,
        value: JSON.stringify(this.buildState),
      },
    }));

    // Runs init for all elements.  The important thing in this step is that
    // it causes the cryptographic signing to happen for all encrypt and
    // static elements.
    await super.init(data);

    // Compile the data from encrypt and static element for inclusion in the
    // validate element.
    let encrypt = {e: {}, v: []};
    for (let element of this.getAllElementsRecursive()) {
      if ((element.renderable instanceof Encrypt.constructor) || (element.renderable instanceof Static.constructor)) {
        encrypt.e[element.name] = {c: element.ivCounter, t: element.encrypted.tag};
      }
      if (element.data && element.data.verifyIncluded) {
        encrypt.v.push(element.name);
      }
    }

    // Finally, add the validate element, and call its init (which was left
    // out of the super.init).
    let formValidate = FormValidate.newInstance(this.context, {
      name: 'validate',
      weight: -999,
      data: {
        encrypt,
        static: [this.renderable.id, this.ivBase],
        ivCounter: this.ivCounter,
      },
    });
    this.addInstance(formValidate);
    await formValidate.init();
  }

  async commit() {
    const TagPair = this.context.theme.getRenderable('TagPair');
    let tagPairInstance = TagPair.newInstance(this.context);
    await tagPairInstance.init({
      tag: 'form',
      attributes: {
        method: 'post',
        action: '',
        enctype: 'multipart/form-data',
        'accept-charset': 'UTF-8',
        autocomplete: 'on', //HTML 5
        name: this.renderable.id,
        id: new Set([this.renderable.id]),
        novalidate: false, //HTML 5 - 'novalidate'
      },
      content: await super.commit(),
    });
    return await tagPairInstance.commit();
  }

  async validate() {
    // TODO: add form validate
    // In the event of an error, set context.formApiError = true;
    for (let instance of this.instanceRegistry.getIterator()) {
      if (instance.validate) {
        await instance.validate();
      }
    }
  }

  async submit() {
    for (let instance of this.instanceRegistry.getIterator()) {
      if (instance.submit) {
        await instance.submit();
      }
    }
  }

  setError(elementName, message) {
    this.validationError = true;
    this.context.engine.pluginRegistry.get('FormApi').setError(this.context, this.renderable.id, elementName, message);
  }

  addInstance(instance) {
    if (instance && instance.setFormInstance) {
      instance.setFormInstance(this);
    }
    return super.addInstance(instance);
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

module.exports = FormInstance;
