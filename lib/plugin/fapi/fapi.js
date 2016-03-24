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
    engine.registry.http.incoming.set({id: 'fapi', weight: -998, incoming: (...args) => this.incoming(...args)});

    // Register Theme elements
    engine.plugin.get('Theme')
      .setRenderable(require('./renderable/tagSingle.js'))
      .setRenderable(require('./renderable/tagPair.js'))

    // Register Fapi form elements
    this
      .setElement(require('./element/hidden'))
      .setElement(require('./element/encrypt'))
      .setElement(require('./element/static'))
      .setElement(require('./element/button'))
      .setElement(require('./element/text'))
  }

  setForm (formModule) {
    formModule.id = formModule.id || formModule.name;
    this.form[formModule.id] = formModule;
    this.form[formModule.id].validate = formModule.constructor.validate || new Registry();
    this.form[formModule.id].submit = formModule.constructor.submit || new Registry();
    return this;
  }

  getForm (id) {
    if (!this.form[id]) {
      throw 'Unregistered form: ' + id;
    }
    return this.form[id];
  }

  setElement (element) {
    element.id = element.name;
    this.element[element.id] = element;
    return this;
  }

  getElement (id) {
    if (!this.element[id]) {
      throw 'Unregistered form element: ' + id;
    }
    return this.element[id];
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
        form = {};

    return promisify(function(self, next) {
      let {request} = context;
      context.formError = {};
      context.post = {};
      if (request.method !== 'POST') {
        return next();
      }

      // Parse form data.
      // Example: https://github.com/mscdex/busboy
      busboy = new Busboy({headers: request.headers });

      // Set file processing.
      busboy.on('file', postFile);

      // Set regular field processing.
      busboy.on('field', postField);

      // Set the finish processing.
      busboy.on('finish', postFinish);
      request.pipe(busboy);
    })(this);

    function postFile(fieldname, file, filename, encoding, mimetype) {
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
        file.on('data', function(data) {});
        file.on('end', function() {});
      }
      // file.on('data', function(data) {
      //   console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      // });
      // file.on('end', function() {
      //   console.log('File [' + fieldname + '] Finished');
      // });
    };

    function postField(fieldname, val, fieldnameTruncated, valTruncated) {
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
    }

    function postFinish(next) {
      context.post.__raw = post;

      // Is key valid?
      let validate = parseOrError(request, 'validate', post.validate);
      if (validate.length != 3 || validate[2].length != 3) {
        context.fapiError = true;
        context.message.set('validateToken', 'Form validation token is broken.', 'danger');
        return next();
      }
      let tag = validate[1];
      let formID = validate[2][0];
      let iv = validate[2][1];
      // Set up a dummy form with the uuid IV.
      let dummyForm = require('./form')({}, {}, iv);

      // We're not exactly decrypting, but rather an exception will be
      // thrown if the information does not validate.
      if (false === cipher.decryptSigned({tag: tag, aad: JSON.stringify([validate[0], validate[2]]), content:''}, request.session.fapikeyraw, dummyForm.getIV('validate' + validate[0]))) {
        context.fapiError = true;
        context.message.set('validateToken', 'Form validation token is broken.', 'danger');
        return next();
      };

      // Verify that all required fields are present
      let required = validate[2][2];
      for (let i = 0; i < required.length; i++) {
        if (post[required[i]] == undefined) {
          context.fapiError = true;
          context.message.set('checkRequired', 'Form is missing required elements.', 'danger');
          return next();
        }
      }

      // Recover the buildState information (if it exists);
      let buildState = {};
      if (post.buildState) {
        let buildStateEncrypted = parseOrError(request, 'buildState', post.buildState);
        if ((buildStateEncrypted !== false) && (buildStateEncrypted.length == 3)) {
          let buildStateJson = cipher.decryptSigned({tag: buildStateEncrypted[1], aad: '', content: buildStateEncrypted[2]}, request.session.fapikeyraw, dummyForm.getIV('buildState' + buildStateEncrypted[0]))
          if (buildStateJson !== false) {
            buildState = parseOrError(request, 'buildState', buildStateJson);
            if (buildState === false) {
              context.fapiError = true;
              context.message.set('buildState', 'Form buildState data is broken.', 'danger');
            }
          }
          else {
            context.fapiError = true;
            context.message.set('buildState', 'Form buildState data is broken.', 'danger');
          }
        }
        else {
          context.fapiError = true;
          context.message.set('buildState', 'Form buildState data is broken.', 'danger');
        }
      }
      if (context.fapiError) {
        return next();
      }

      // Reconstitute the form
      // TODO: Validate that form is valid (use attempt()?)
      form = self.getForm(formID)({}, buildState, iv);
      form.buildForm(function() {
        // Run Validators
        context.post.formName = form.formName;
        context.post[form.formName] = {};
        form.validate.execute(context, afterValidate);
      });
    }

    function afterValidate () {
      if (context.fapiError) {
        return next();
      }
      form.submit.execute(context, afterSubmit);
    }

    function afterSubmit() {
      next();
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
