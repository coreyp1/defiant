"use strict";

const HiddenInstance = require('./hiddenInstance');
const Cipher = require('../../../util/cipher');

class StaticInstance extends HiddenInstance {
  async init(data={}) {
    await super.init(data);

    // Compute cryptographic signing.
    this.ivCounter = this.formInstance.getNextIVCounter().toString();
    this.encrypted = Cipher.encryptSigned('', this.data.value, this.context.session.formApiKeyRaw,  this.formInstance.getIV(this.name + this.ivCounter));
  }
}

module.exports = StaticInstance;
