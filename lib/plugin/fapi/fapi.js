"use strict";

const Plugin = require('../plugin');
const Registry = require('../../util/registry');

class Fapi extends Plugin {
  constructor(engine) {
    super(engine);
    this.form = {};
    this.element = {};

    // Process incoming Http requests for form elements
    engine.plugin.get('Router').router.addHandler(require('./handler/fapiHandler'));

    // Register Fapi form elements
    this
      .setElement(require('./element/hidden'))
      .setElement(require('./element/encrypt'))
      .setElement(require('./element/static'))
      .setElement(require('./element/formValidate'))
      .setElement(require('./element/button'))
      .setElement(require('./element/password'))
      .setElement(require('./element/text'))
      .setElement(require('./element/textarea'))
      .setElement(require('./element/checkboxes'))
      .setElement(require('./element/radios'))
      .setElement(require('./element/select'))
      .setElement(require('./element/fieldset'));

    // Create registries for validate and submit functions of forms.
    this.validateRegistry = {};
    this.submitRegistry = {};
  }

  setForm(formModule) {
    formModule.id = formModule.id || formModule.name;
    this.form[formModule.id] = formModule;
    this.form[formModule.id].validate = formModule.constructor.validate || new Registry();
    this.form[formModule.id].submit = formModule.constructor.submit || new Registry();
    return this;
  }

  getForm(id) {
    if (!this.form[id]) {
      throw 'Unregistered form: ' + id;
    }
    return this.form[id];
  }

  setElement(element) {
    element.id = element.name;
    this.element[element.id] = element;
    return this;
  }

  getElement(id) {
    if (!this.element[id]) {
      throw 'Unregistered form element: ' + id;
    }
    return this.element[id];
  }

  setValidate(form, validate) {
    if (!this.validateRegistry[form]) {
      this.validateRegistry[form] = new Registry();
    }
    this.validateRegistry[form].set(validate);
  }

  getValidate(form) {
    return !this.validateRegistry[form] ? [] : this.validateRegistry[form].getOrderedElements();
  }

  setSubmit(form, submit) {
    if (!this.submitRegistry[form]) {
      this.submitRegistry[form] = new Registry();
    }
    this.submitRegistry[form].set(submit);
  }

  getSubmit(form) {
    return !this.submitRegistry[form] ? [] : this.submitRegistry[form].getOrderedElements();
  }

  setError(context, formId, elementName, message) {
    context.fapiError = true;
    context.volatile.message.set(elementName, message, 'danger');
    context.fapiErrorList.formId.push(elementName);
  }
}

module.exports = Fapi;
