"use strict";

const HiddenInstance = require('./hiddenInstance');
const Cipher = require('../../../util/cipher');

class EncryptInstance extends HiddenInstance {
  async init(data={}) {
    // Perform the encryption.
    this.plainText = this.data.value;
    this.ivCounter = this.formInstance.getNextIVCounter().toString();
    this.encrypted = Cipher.encryptSigned(this.plainText, '', this.context.session.formApiKeyRaw, this.formInstance.getIV(this.name + this.ivCounter));
    this.data.value = this.encrypted.content;

    await super.init(data);
  }

  async validate() {
    if (this.validated) {
      // Don't double-decrypt.
      return;
    }

    // Gather the variables necessary to decrypt the posted information.
    let post = (this.context.post && this.context.post[this.formInstance.id]) ? this.context.post[this.formInstance.id] : {};
    let encryptKeys = (this.context.post && this.context.post.encryptKeys) ? this.context.post.encryptKeys : {};
    let formValidate = encryptKeys[this.name] || {};

    // Put the decrypted information into the post variable.
    let value = (post && post[this.name]) ? post[this.name] : undefined;

    // Perform the decryption.
    if (value && (typeof value === 'string')) {
      value = Cipher.decryptSigned({tag: formValidate.t, aad: '', content: value}, this.context.session.formApiKeyRaw, this.formInstance.getIV(this.name + formValidate.c));
      if (value !== false) {
        // The decryption was successful.
        post[this.name] = value;
      }
      else {
        // TODO: Translate.
        this.formInstance.setError('decryptFailed', 'There was an error while trying to decrypt some of the form.');
      }
    }

    this.validated = true;

    await super.validate();
  }
}

module.exports = EncryptInstance;
