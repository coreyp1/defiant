"use strict";

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const cipher = require('../../util/cipher');
const Busboy = require('busboy');
const path = require('path');
const fs = require('fs');
const os = require('os');
const {coroutine: co, promisify} = require('bluebird');

class Fapi extends Plugin {
  constructor(engine) {
    super(engine);
    this.form = {};
    this.element = {};

    // Process incoming Http requests for form elements
    engine.registry.http.incoming.set({id: 'fapi', weight: -500, incoming: (...args) => this.incoming(...args)});

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
    if (!this.validateRegistry.form) {
      this.validateRegistry.form = new Registry();
    }
    this.validateRegistry.form.set(validate);
  }

  getValidate(form) {
    return !this.validateRegistry.form ? [] : this.validateRegistry.form.getOrderedElements();
  }

  setSubmit(form, submit) {
    if (!this.submitRegistry.form) {
      this.submitRegistry.form = new Registry();
    }
    this.submitRegistry.form.set(submit);
  }

  getSubmit(form) {
    return !this.submitRegistry.form ? [] : this.submitRegistry.form.getOrderedElements();
  }

  setError(context, formId, elementName, message) {
    context.fapiError = true;
    context.message.set(elementName, message, 'danger');
    context.fapiErrorList.formId.push(elementName);
  }

  /**
   * Helper function to take form element names and drill-down into the addTo
   * object, inserting the *value* where appropriate.
   * ex: 'foo[bar][]' ==> { foo: bar: [].push(value) }
   **/
  drillDownAdd(addTo, name, value) {
    let isArray = false;
    let fieldname = name;
    if (fieldname.substring(fieldname.length - 2) == '[]') {
      isArray = true
      fieldname = fieldname.substring(0, fieldname.length - 2);
    }
    let parts = fieldname.split(/[\[\]]+/);
    let obj = addTo;
    let part = '';
    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) {
        if (part) {
          if (!obj[part]) {
            obj[part] = {};
          }
          obj = obj[part];
        }
        part = parts[i];
      }
    }
    if (isArray) {
      if (!(obj[part]) || (obj[part].constructor !== Array)) {
        obj[part] = [];
      }
      obj[part].push(value);
    }
    else {
      obj[part] = value;
    }
  }

  incoming(context) {
    let busboy,
        post = {},
        form = {},
        {request} = context;

    // Create the fapiErrorList to hold a list of elements in an error state.
    context.fapiErrorList = {};
    context.formError = {};
    context.post = {};
    if (request.method !== 'POST') {
      return Promise.resolve();
    }

    // Temporarily set a theme so that the form.init() can make use of it.
    context.theme = context.engine.plugin.get('ThemeBase');

    return co(function*(self) {
      // Parsing the headers with busboy requires streams, so use a promise to
      // hide the complexity.
      yield promisify(function(next) {
        // Parse form data.
        // Example: https://github.com/mscdex/busboy
        busboy = new Busboy({headers: request.headers });

        // Set file processing.
        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
          if (filename) {
            drillDownAdd(post, fieldname, {
              name: filename,
              encoding: encoding,
              mime: mimetype,
              path: path.join(os.tmpDir(), path.basename(filename))
            });
            file.pipe(fs.createWriteStream(post[fieldname].path));
          }
          else {
            // TODO: Handle file uploads...
            file.on('data', data => {});
            file.on('end', () => {});
          }
          // file.on('data', function(data) {
          //   console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
          // });
          // file.on('end', function() {
          //   console.log('File [' + fieldname + '] Finished');
          // });
        });

        // Set regular field processing.
        busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated) => {
          if (fieldname.substring(fieldname.length - 2) == '[]') {
            fieldname = fieldname.substring(0, fieldname.length - 2);
            if ((typeof post[fieldname] !== 'object') || (post[fieldname] === null) || (post[fieldname].constructor == Array)) {
              post[fieldname] = {};
            }
            post[fieldname][val] = val;
          }
          else {
            post[fieldname] = val;
          }
          //drillDownAdd(post, fieldname, val);
        });

        // Set the finish processing.
        busboy.on('finish', () => {
          context.post.__raw = post;
          next();
        });
        request.pipe(busboy);
      })();

      let validate = Fapi.parseOrError(request, 'validate', post.validate);

      // Is key valid?
      if (!validate || validate.length != 3 || validate[0].length != 3) {
        context.fapiError = true;
        context.message.set('validateToken', 'Form validation token is broken.', 'danger');
        return cleanup();
      }

      let [[formId, ivBase, iv], encrypted, tag] = validate;
      context.fapiErrorList.formId = [];
      context.post[formId] = post;
      // Set up a dummy form with the uuid IV.
      let dummyForm = new (require('./form'))({}, ivBase);

      // Validate the cryptographic signing of the form.
      let decrypted = cipher.decryptSigned({tag: tag, aad: JSON.stringify(validate[0]), content: validate[1]}, request.session.fapikeyraw, dummyForm.getIV('validate' + iv));
      if (decrypted === false) {
        context.fapiError = true;
        context.message.set('validateToken', 'Form validation token is broken.', 'danger');
        return cleanup();
      };
      decrypted = JSON.parse(decrypted);

      // Recover the buildState information (if it exists);
      let buildStateJson = cipher.decryptSigned({tag: decrypted.e.buildState.t, aad: '', content: post.buildState}, request.session.fapikeyraw, dummyForm.getIV('buildState' + decrypted.e.buildState.c)),
          buildState = Fapi.parseOrError(request, 'buildState', buildStateJson);
      if (!(buildStateJson && buildState)) {
        context.fapiError = true;
        context.message.set('buildState', 'Form buildState data is broken.', 'danger');
        return cleanup();
      }

      let form = new (self.getForm(formId))(buildState, ivBase);
      yield form.init(context, post);

      // Verify that all required fields are present
      decrypted.v.filter(name => post[name] == undefined).map(name => context.fapiError = true);
      if (context.fapiError) {
        form.setError(context, 'checkRequired', 'Form is missing required elements.')
        return cleanup();
      }

      // Run Validators
      yield form.validate(context);
      for (let element of form.getAllElementsRecursive()) {
        yield element.validate ? element.validate(context) : Promise.resolve();
      }
      for (let validate of self.getValidate(formId)) {
        yield validate(context);
      }
      if (context.fapiError) {
        return cleanup();
      }

      // Run Submit
      yield form.submit(context);
      for (let element of form.getAllElementsRecursive()) {
        yield element.submit ? element.submit(context) : Promise.resolve();
      }
      for (let submit of self.getSubmit(formId)) {
        yield submit(context);
      }
      cleanup();
    })(this);

    function cleanup() {
      context.theme = undefined;
    }
  }

  static parseOrError(request, name, value) {
    try {
      return JSON.parse(value);
    }
    catch (e) {
      request.error = true;
    }
  }
}

module.exports = Fapi;
