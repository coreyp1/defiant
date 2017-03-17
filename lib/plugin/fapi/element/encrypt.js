"use strict";

const Hidden = require('./hidden');
const Cipher = require('../../../util/cipher');

class Encrypt extends Hidden {
  init(context) {
    // Perform the encryption.
    this.plainText = this.data.value;
    this.ivCounter = this.form.getNextIVCounter().toString();
    this.encrypted = Cipher.encryptSigned(JSON.stringify(this.plainText), '', context.session.fapikeyraw,  this.form.getIV(this.name + this.ivCounter));
    this.data.value = this.encrypted.content;

    return super.init(context);
  }
}

module.exports = Encrypt;
