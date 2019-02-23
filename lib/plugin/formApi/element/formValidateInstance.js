"use strict";

const HiddenInstance = require('./hiddenInstance');
const Cipher = require('../../../util/cipher');

class FormValidateInstance extends HiddenInstance {
  async init(data={}) {
    // Perform the encryption.
    this.ivCounter = (this.data.ivCounter !== undefined) ? this.data.ivCounter : this.formInstance.getNextIVCounter().toString();
    this.data.static.push(this.ivCounter);
    this.encrypted = Cipher.encryptSigned(JSON.stringify(this.data.encrypt), JSON.stringify(this.data.static), this.context.session.formApiKeyRaw, this.formInstance.getIV(this.name + this.ivCounter));
    this.data.value = JSON.stringify([this.data.static, this.encrypted.content, this.encrypted.tag]);
    super.init(data);
  }
}

module.exports = FormValidateInstance;
