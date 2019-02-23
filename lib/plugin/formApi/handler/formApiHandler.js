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

class FormApiHandler extends Handler {
  async init(context) {
    let busboy,
        post = {},
        {request} = context;

    // Create formApiErrorList to hold a list of elements in an error state.
    context.formApiErrorList = {};
    context.formError = {};
    context.post = {};
    if (request.method !== 'POST') {
      return;
    }

    let FormApi = context.engine.pluginRegistry.get('FormApi');

    // Parsing the headers with busboy requires streams, so use a promise to
    // hide the complexity.
    let files = [];
    await new Promise((accept) => {
      // Parse form data.
      // Example: https://github.com/mscdex/busboy
      // TODO: Expose Busboy options to admin, such as upload limits.
      busboy = new Busboy({headers: request.headers });

      // Set file processing.
      busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (filename) {
          if (!post[fieldname]) {
            post[fieldname] = {};
            files.push(fieldname);
          }
          let uniqueId = uuid.v4();
          let fileData = {
            uuid: uniqueId,
            type: 'file',
            name: filename,
            encoding: encoding,
            mime: mimetype,
            path: path.join(os.tmpdir(), uniqueId),
            size: 0,
          };
          post[fieldname][uniqueId] = fileData;
          file.on('data', data => fileData.size += data.length);
          // TODO: Handle broken, incomplete, and file-too-big errors.
          file.on('limit', () => {});
          file.on('end', () => {});
          file.pipe(fs.createWriteStream(fileData.path));
        }
        else {
          // There was no upload.  Resume the stream to continue processing.
          file.resume();
        }
      });

      // Set regular field processing.
      busboy.on('field', (fieldname, val) => {
        // Actual potential values passed in include:
        // (fieldname, val, fieldnameTruncated, valTruncated)

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
        accept();
      });
      request.pipe(busboy);
    });

    // If there are any file uploads, put them into the File table so that
    // they can be handled cleanly.  Note: All uploaded files are in the OS
    // temp directory, so if anything has failed before this point, they will
    // be automatically removed at the next OS restart.
    let fileUploadEntity = context.engine.pluginRegistry.get('Orm').entityRegistry.get('fileUpload');
    for (let fieldName of files) {
      post[`${fieldName}[data]`] = {};
      for (let uuid in post[fieldName]) {
        let file = post[fieldName][uuid];
        // TODO: Directory should be customizable.
        let directory = '/var/defiant/files';
        await mkdirp(directory);
        // Move the file.
        let newPath = await rename(file.path, path.join(directory, file.name));
        // Create the file table entry.
        if (typeof newPath === 'string') {
          let entity = {
            uuid,
            accountId: context.account.id,
            size: file.size,
            originalName: file.name,
            usageCount: 0,
            path: newPath,
          };
          await fileUploadEntity.save(entity);
          post[`${fieldName}[data]`][entity.id] = {id: entity.id, uuid: entity.uuid};
        }
        else {
          // The move failed.  Remove the file.
          // TODO: Log errors.
          try {
            await fs.promises.unlink(file.path);
          }
          catch (e) {}
          file.error = true;
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
    let dummyForm = new Form(context.engine).newInstance(context, {ivBase});
    await dummyForm.init();

    // Validate the cryptographic signing of the form.
    let decrypted = cipher.decryptSigned({tag: tag, aad: JSON.stringify(validate[0]), content: validate[1]}, context.session.formApiKeyRaw, dummyForm.getIV('validate' + iv));
    if (decrypted === false) {
      context.formApiError = true;
      // TODO: Translate.
      context.volatile.message.set('validateToken', 'Form validation token is broken.', 'danger');
      return;
    }
    decrypted = JSON.parse(decrypted);
    context.post.encryptKeys = decrypted.e || {};

    // Recover the buildState information (if it exists).
    let buildStateJson = cipher.decryptSigned({tag: decrypted.e.buildState.t, aad: '', content: post.buildState}, context.session.formApiKeyRaw, dummyForm.getIV('buildState' + decrypted.e.buildState.c)),
        buildState = FormApiHandler.parseOrError(request, 'buildState', buildStateJson);
    if (!(buildStateJson && buildState)) {
      context.formApiError = true;
      // TODO: Translate.
      context.volatile.message.set('buildState', 'Form buildState data is broken.', 'danger');
      return;
    }

    const form = FormApi.getForm(formId);
    const formInstance = form.newInstance(context, {buildState, ivBase});
    await formInstance.init();

    // Verify that all required fields are present
    decrypted.v.filter(name => post[name] == undefined).map(() => context.formApiError = true);
    if (context.formApiError) {
      // TODO: Translate.
      formInstance.setError('checkRequired', 'Form is missing required elements.')
      return;
    }

    // Run Validators
    await formInstance.validate();
    if (context.formApiError) {
      return;
    }

    // Run Submit
    await formInstance.submit();
    for (let element of formInstance.getAllElementsRecursive()) {
      await element.submit ? element.submit() : Promise.resolve();
    }

    // Finally, if any uploaded files have not been processed, remove them.
    for (let fieldName of files) {
      for (let uuid in post[fieldName]) {
        if (!post[fieldName][uuid].processed) {
          // Delete the file.
          await fs.promises.unlink(post[fieldName][uuid].path);

          // Remove it from the fileUpload table.
          let fileUpload = context.engine.pluginRegistry.get('Orm').entityRegistry.get('fileUpload');
          await fileUpload.purge(post[fieldName][uuid].id);

          // Remove the entry from the post.
          delete post[fieldName][uuid];
        }
      }
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

FormApiHandler.id = 'FormApi.FormApiHandler';
FormApiHandler.path = '';
FormApiHandler.weight = -500;

module.exports = FormApiHandler;
