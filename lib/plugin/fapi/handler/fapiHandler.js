"use strict";

const Handler = require('../../router/handler');
const Busboy = require('busboy');
const Form = require('../form');
const cipher = require('../../../util/cipher');
const path = require('path');
const fs = require('fs');
const os = require('os');
const {coroutine: co, promisify} = require('bluebird');

class FapiHandler extends Handler {
  init(context) {
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

    let Fapi = context.engine.plugin.get('Fapi');

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

      let validate = FapiHandler.parseOrError(request, 'validate', post.validate);

      // Is key valid?
      if (!validate || validate.length != 3 || validate[0].length != 3) {
        context.fapiError = true;
        context.message.set('validateToken', 'Form validation token is broken.', 'danger');
        return;
      }

      let [[formId, ivBase, iv], encrypted, tag] = validate;
      context.fapiErrorList.formId = [];
      context.post[formId] = post;
      // Set up a dummy form with the uuid IV.
      let dummyForm = new Form({}, ivBase);

      // Validate the cryptographic signing of the form.
      let decrypted = cipher.decryptSigned({tag: tag, aad: JSON.stringify(validate[0]), content: validate[1]}, request.session.fapikeyraw, dummyForm.getIV('validate' + iv));
      if (decrypted === false) {
        context.fapiError = true;
        context.message.set('validateToken', 'Form validation token is broken.', 'danger');
        return;
      };
      decrypted = JSON.parse(decrypted);

      // Recover the buildState information (if it exists);
      let buildStateJson = cipher.decryptSigned({tag: decrypted.e.buildState.t, aad: '', content: post.buildState}, request.session.fapikeyraw, dummyForm.getIV('buildState' + decrypted.e.buildState.c)),
          buildState = FapiHandler.parseOrError(request, 'buildState', buildStateJson);
      if (!(buildStateJson && buildState)) {
        context.fapiError = true;
        context.message.set('buildState', 'Form buildState data is broken.', 'danger');
        return;
      }

      let form = new (Fapi.getForm(formId))(buildState, ivBase);
      yield form.init(context, post);

      // Verify that all required fields are present
      decrypted.v.filter(name => post[name] == undefined).map(name => context.fapiError = true);
      if (context.fapiError) {
        form.setError(context, 'checkRequired', 'Form is missing required elements.')
        return;
      }

      // Run Validators
      yield form.validate(context);
      for (let element of form.getAllElementsRecursive()) {
        yield element.validate ? element.validate(context) : Promise.resolve();
      }
      for (let validate of Fapi.getValidate(formId)) {
        yield validate(context);
      }
      if (context.fapiError) {
        return;
      }

      // Run Submit
      yield form.submit(context);
      for (let element of form.getAllElementsRecursive()) {
        yield element.submit ? element.submit(context) : Promise.resolve();
      }
      for (let submit of Fapi.getSubmit(formId)) {
        yield submit(context);
      }
    })(this);
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

  static parseOrError(request, name, value) {
    try {
      return JSON.parse(value);
    }
    catch (e) {
      request.error = true;
    }
  }
}

FapiHandler.id = 'Fapi.FapiHandler';
FapiHandler.path = '';
FapiHandler.weight = -500;

module.exports = FapiHandler;
