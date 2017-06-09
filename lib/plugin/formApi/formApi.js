"use strict";

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const FileTable = require('../fileApi/table/fileTable');

class FormApi extends Plugin {
  constructor(engine) {
    super(engine);
    this.form = {};
    this.element = {};

    // Process incoming Http requests for form elements
    engine.pluginRegistry.get('Router').addHandler(new (require('./handler/formApiHandler'))());

    // Register FormApi form elements
    this
      .setElement(require('./element/genericRenderable'))
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
      .setElement(require('./element/fieldset'))
      .setElement(require('./element/file'));

    // Create registries for validate and submit functions of forms.
    this.validateRegistry = {};
    this.submitRegistry = {};

    // Declare the File Upload Table.
    let fileUploadTable = new FileTable(engine, 'fileUpload', {});
    engine.pluginRegistry.get('Orm').entity.set(fileUploadTable);
  }

  setForm(formModule) {
    formModule.id = formModule.id || formModule.name;
    this.form[formModule.id] = formModule;
    this.form[formModule.id].validateRegistry = formModule.constructor.validateRegistry || new Registry();
    this.form[formModule.id].submitRegistry = formModule.constructor.submitRegistry || new Registry();
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
    context.formApiError = true;
    context.volatile.message.set(elementName, message, 'danger');
    context.formApiErrorList.formId.push(elementName);
  }
}

module.exports = FormApi;
