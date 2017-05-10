"use strict";

const Hidden = require('./hidden');
const Cipher = require('../../../util/cipher');

class FormValidate extends Hidden {
  init(context) {
    // Perform the encryption.
    this.ivCounter = (this.data.ivCounter !== undefined) ? this.data.ivCounter : this.form.getNextIVCounter().toString();
    this.data.static.push(this.ivCounter);
    this.encrypted = Cipher.encryptSigned(JSON.stringify(this.data.encrypt), JSON.stringify(this.data.static), context.session.formApiKeyRaw, this.form.getIV(this.name + this.ivCounter));
    this.data.value = JSON.stringify([this.data.static, this.encrypted.content, this.encrypted.tag]);

    return super.init(context);
  }
}

module.exports = FormValidate;
