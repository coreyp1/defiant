"use strict";

const Handler = require('../../router/handler');
const Busboy = require('busboy');
const Form = require('../form');
const cipher = require('../../../util/cipher');
const mkdirp = require('../../../util/mkdirp');
const rename = require('../../../util/rename');
const uuid = require('node-uuid');
const path = require('path');
const fs = require('fs');
const os = require('os');
const {coroutine: co, promisify} = require('bluebird');
const unlink = promisify(fs.unlink);

class FormApiHandler extends Handler {
  init(context) {
    let busboy,
        post = {},
        form = {},
        {request} = context;

    // Create formApiErrorList to hold a list of elements in an error state.
    context.formApiErrorList = {};
    context.formError = {};
    context.post = {};
    if (request.method !== 'POST') {
      return Promise.resolve();
    }

    let FormApi = context.engine.plugin.get('FormApi');

    return co(function*(self) {
      // Parsing the headers with busboy requires streams, so use a promise to
      // hide the complexity.
      yield promisify(function(next) {
        // Parse form data.
        // Example: https://github.com/mscdex/busboy
        // TODO: Expose Busboy options to admin, such as upload limits.
        busboy = new Busboy({headers: request.headers });

        // Set file processing.
        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
          if (filename) {
            post[fieldname] = {
              type: 'file',
              name: filename,
              encoding: encoding,
              mime: mimetype,
              path: path.join(os.tmpdir(), uuid.v4()),
              size: 0,
            };
            file.on('data', data => post[fieldname].size += data.length);
            // TODO: Handle broken, incomplete, and file-too-big errors.
            file.on('limit', () => {});
            file.on('end', () => {});
            file.pipe(fs.createWriteStream(post[fieldname].path));
          }
          else {
            // There was no upload.  Resume the stream to continue processing.
            file.resume();
          }
        });

        // Set regular field processing.
        busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated) => {
          if (fieldname.substring(fieldname.length - 2) == '[]') {
            // If there is an empty bracket (e.g., '[]') at the end of the
            // fieldname, then this is input from a checkbox or radio button.
            //
            // In this case, treat the value as an element in an object.
            // The value will always a string, so use it for both the key and
            // value in the object, which makes it easier for the form object
            // to identify what has been passed in.
            // E.g., post[fieldname][foo] = foo.
            fieldname = fieldname.substring(0, fieldname.length - 2);
            if ((typeof post[fieldname] !== 'object') || (post[fieldname] === null) || (post[fieldname].constructor == Array)) {
              post[fieldname] = {};
            }
            post[fieldname][val] = val;
          }
          else {
            post[fieldname] = val;
          }
        });

        // Set the finish processing.
        busboy.on('finish', () => {
          context.post.__raw = post;
          next();
        });
        request.pipe(busboy);
      })();

      // If there are any file uploads, put them into the File table so that
      // they can be handled cleanly.  Note: All uploaded files are in the OS
      // temp directory, so if anything has failed before this point, they will
      // be automatically removed at the next OS restart.
      let fileUploadEntity = context.engine.plugin.get('Orm').entity.get('fileUpload');
      for (let fieldName in post) {
        if (post[fieldName].type === 'file') {
          // TODO: Directory should be customizable.
          let directory = '/var/defiant/files';
          yield mkdirp(directory);
          // Move the file.
          let newPath = yield rename(post[fieldName].path, path.join(directory, post[fieldName].name));
          // Create the file table entry.
          if (typeof newPath === 'string') {
            let entity = {
              uuid: path.basename(post[fieldName].path),
              accountId: context.account.id,
              size: post[fieldName].size,
              originalName: post[fieldName].name,
              usageCount: 0,
              path: newPath,
            };
            yield fileUploadEntity.save(entity);
            post[`${fieldName}[data]`] = {id: entity.id};
          }
          else {
            // The move failed.  Remove the file.
            // TODO: Log errors.
            try {
              yield unlink(post[fieldName].path);
            }
            catch (e) {};
            post[fieldName].error = true;
          }
        }
      }

      let validate = FormApiHandler.parseOrError(request, 'validate', post.validate);

      // Is key valid?
      if (!validate || validate.length != 3 || validate[0].length != 3) {
        context.formApiError = true;
        // TODO: Translate.
        context.volatile.message.set('validateToken', 'Form validation token is broken.', 'danger');
        return;
      }

      let [[formId, ivBase, iv], encrypted, tag] = validate;
      context.formApiErrorList.formId = [];
      context.post[formId] = post;
      // Set up a dummy form with the uuid IV.
      let dummyForm = new Form({}, ivBase);

      // Validate the cryptographic signing of the form.
      let decrypted = cipher.decryptSigned({tag: tag, aad: JSON.stringify(validate[0]), content: validate[1]}, context.session.formApiKeyRaw, dummyForm.getIV('validate' + iv));
      if (decrypted === false) {
        context.formApiError = true;
        // TODO: Translate.
        context.volatile.message.set('validateToken', 'Form validation token is broken.', 'danger');
        return;
      };
      decrypted = JSON.parse(decrypted);
      context.post.encryptKeys = decrypted.e || {};

      // Recover the buildState information (if it exists);
      let buildStateJson = cipher.decryptSigned({tag: decrypted.e.buildState.t, aad: '', content: post.buildState}, context.session.formApiKeyRaw, dummyForm.getIV('buildState' + decrypted.e.buildState.c)),
          buildState = FormApiHandler.parseOrError(request, 'buildState', buildStateJson);
      if (!(buildStateJson && buildState)) {
        context.formApiError = true;
        // TODO: Translate.
        context.volatile.message.set('buildState', 'Form buildState data is broken.', 'danger');
        return;
      }

      let form = new (FormApi.getForm(formId))(buildState, ivBase);
      yield form.init(context, post);

      // Verify that all required fields are present
      decrypted.v.filter(name => post[name] == undefined).map(name => context.formApiError = true);
      if (context.formApiError) {
        // TODO: Translate.
        form.setError(context, 'checkRequired', 'Form is missing required elements.')
        return;
      }

      // Run Validators
      yield form.validate(context);
      for (let validate of FormApi.getValidate(formId)) {
        yield validate(context);
      }
      if (context.formApiError) {
        return;
      }

      // Run Submit
      yield form.submit(context);
      for (let element of form.getAllElementsRecursive()) {
        yield element.submit ? element.submit(context) : Promise.resolve();
      }
      for (let submit of FormApi.getSubmit(formId)) {
        yield submit(context);
      }
    })(this);
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

FormApiHandler.id = 'FormApi.FormApiHandler';
FormApiHandler.path = '';
FormApiHandler.weight = -500;

module.exports = FormApiHandler;
