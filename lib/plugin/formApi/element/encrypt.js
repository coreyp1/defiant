"use strict";

const Hidden = require('./hidden');
const Cipher = require('../../../util/cipher');

class Encrypt extends Hidden {
  async init(context) {
    // Perform the encryption.
    this.plainText = this.data.value;
    this.ivCounter = this.form.getNextIVCounter().toString();
    this.encrypted = Cipher.encryptSigned(JSON.stringify(this.plainText), '', context.session.formApiKeyRaw, this.form.getIV(this.name + this.ivCounter));
    this.data.value = this.encrypted.content;

    return super.init(context);
  }

  async validate(context) {
    if (this.validated) {
      // Don't double-decrypt.
      return;
    }

    // Gather the variables necessary to decrypt the posted information.
    let post = (context.post && context.post[this.form.name]) ? context.post[this.form.name] : {};
    let encryptKeys = (context.post && context.post.encryptKeys) ? context.post.encryptKeys : {};
    let formValidate = encryptKeys[this.name] || {};

    // Put the decrypted information into the post variable.
    let value = (post && post[this.name]) ? post[this.name] : undefined;

    // Perform the decryption.
    if (value && (typeof value === 'string')) {
      value = Cipher.decryptSigned({tag: formValidate.t, aad: '', content: value}, context.session.formApiKeyRaw, this.form.getIV(this.name + formValidate.c));
      if (value !== false) {
        // The decryption was successful.
        post[this.name] = JSON.parse(value);
      }
      else {
        // TODO: Translate.
        this.form.setError(context, 'decryptFailed', 'There was an error while trying to decrypt some of the form.');
      }
    }

    this.validated = true;

    await super.validate(context);
  }
}

module.exports = Encrypt;
