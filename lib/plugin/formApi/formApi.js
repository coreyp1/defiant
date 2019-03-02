"use strict";

const Plugin = require('../plugin');
const InitRegistry = require('../../util/initRegistry');
const FileTable = require('../fileApi/table/fileTable');
const Element = require('./element');

class FormApi extends Plugin {
  constructor(engine) {
    super(engine);
    this.formRegistry = new InitRegistry({}, [engine]);
    this.elementRegistry = new InitRegistry({}, [engine]);

    // Process incoming Http requests for form elements
    engine.pluginRegistry.get('Router').addHandler(new (require('./handler/formApiHandler'))());

    // Register FormApi form elements
    this
      .setElement(new Element(engine))
      .setElement(require('./element/genericRenderable'))
      .setElement(new Element(engine, {
        id: 'Hidden',
        Instance: require('./element/hiddenInstance'),
      }))
      .setElement(new Element(engine, {
        id: 'Encrypt',
        Instance: require('./element/encryptInstance'),
      }))
      .setElement(new Element(engine, {
        id: 'Static',
        Instance: require('./element/staticInstance'),
      }))
      .setElement(new Element(engine, {
        id: 'FormValidate',
        Instance: require('./element/formValidateInstance'),
      }))
      .setElement(new Element(engine, {
        id: 'Button',
        template: 'TagPair',
        Instance: require('./element/buttonInstance'),
      }))
      .setElement(new Element(engine, {
        id: 'Password',
        Instance: require('./element/passwordInstance'),
      }))
      .setElement(new Element(engine, {
        id: 'Text',
        Instance: require('./element/textInstance'),
      }))
      .setElement(new Element(engine, {
        id: 'Textarea',
        Instance: require('./element/textareaInstance'),
      }))
      .setElement(new Element(engine, {
        id: 'Checkboxes',
        Instance: require('./element/checkboxesInstance')
      }))
      .setElement(new Element(engine, {
        id: 'Radios',
        Instance: require('./element/radiosInstance'),
      }))
      .setElement(new Element(engine, {
        id: 'Select',
        Instance: require('./element/selectInstance'),
      }))
      .setElement(new Element(engine, {
        id: 'Fieldset',
        Instance: require('./element/fieldsetInstance'),
      }))
      .setElement(new Element(engine, {
        id: 'File',
        Instance: require('./element/fileInstance'),
      }));

    // Create registries for validate and submit functions of forms.
    this.validateRegistry = {};
    this.submitRegistry = {};

    // Declare the File Upload Table.
    let fileUploadTable = new FileTable(engine, 'fileUpload', {});
    engine.pluginRegistry.get('Orm').entityRegistry.set(fileUploadTable);
  }

  setForm(formModule) {
    this.formRegistry.set(formModule);
    return this;
  }

  getForm(formId) {
    let form = this.formRegistry.get(formId);
    if (!form) {
      throw 'Unregistered form: ' + formId;
    }
    return form;
  }

  setElement(element) {
    this.elementRegistry.set(element);
    return this;
  }

  getElement(elementId) {
    let element = this.elementRegistry.get(elementId);
    if (!element) {
      throw 'Unregistered form element: ' + elementId;
    }
    return element;
  }

  setValidate(formId, validate) {
    let form = this.formRegistry(formId);
    if (!form) {
      throw 'Unregistered form: ' + formId;
    }
    return form.validateRegistry.set(validate);
  }

  getValidate(formId) {
    let form = this.formRegistry(formId);
    if (!form) {
      throw 'Unregistered form: ' + formId;
    }
    return form.validateRegistry.getOrderedElements();
  }

  setSubmit(formId, submit) {
    let form = this.formRegistry(formId);
    if (!form) {
      throw 'Unregistered form: ' + formId;
    }
    return form.submitRegistry.set(submit);
  }

  getSubmit(formId) {
    let form = this.formRegistry(formId);
    if (!form) {
      throw 'Unregistered form: ' + formId;
    }
    return form.submitRegistry.getOrderedElements();
  }

  setError(context, formId, elementName, message) {
    context.formApiError = true;
    context.volatile.message.set(elementName, message, 'danger');
    context.formApiErrorList.formId.push(elementName);
  }
}

module.exports = FormApi;
