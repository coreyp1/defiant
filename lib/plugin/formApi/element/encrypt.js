"use strict";

const Hidden = require('./hidden');
const {coroutine: co} = require('bluebird');
const Cipher = require('../../../util/cipher');

class Encrypt extends Hidden {
  init(context) {
    // Perform the encryption.
    this.plainText = this.data.value;
    this.ivCounter = this.form.getNextIVCounter().toString();
    this.encrypted = Cipher.encryptSigned(JSON.stringify(this.plainText), '', context.session.formApiKeyRaw, this.form.getIV(this.name + this.ivCounter));
    this.data.value = this.encrypted.content;

    return super.init(context);
  }

  validate(context) {
    return co(function*(self, superValidate){
      if (self.validated) {
        // Don't double-decrypt.
        return Promise.resolved();
      }

      // Gather the variables necessary to decrypt the posted information.
      let post = (context.post && context.post[self.form.name]) ? context.post[self.form.name] : {};
      let encryptKeys = (context.post && context.post.encryptKeys) ? context.post.encryptKeys : {};
      let formValidate = encryptKeys[self.name] || {};

      // Put the decrypted information into the post variable.
      let value = (post && post[self.name]) ? post[self.name] : undefined;

      // Perform the decryption.
      if (value) {
        value = Cipher.decryptSigned({tag: formValidate.t, aad: '', content: value}, context.session.formApiKeyRaw, self.form.getIV(self.name + formValidate.c));
        if (value !== false) {
          // The decryption was successful.
          post[self.name] = JSON.parse(value);
        }
        else {
          // TODO: Translate.
          self.form.setError(context, 'decryptFailed', 'There was an error while trying to decrypt some of the form.');
        }
      }

      self.validated = true;

      yield superValidate.call(self, context);
    })(this, super.validate);
  }
}

module.exports = Encrypt;
