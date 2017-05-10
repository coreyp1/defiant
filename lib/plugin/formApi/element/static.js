"use strict";

const Hidden = require('./hidden');
const Cipher = require('../../../util/cipher');

class Static extends Hidden {
  init(context) {
    // Compute cryptographic signing.
    this.ivCounter = this.form.getNextIVCounter().toString();
    this.encrypted = Cipher.encryptSigned('', this.data.value, context.session.formApiKeyRaw,  this.form.getIV(this.name + this.ivCounter));

    return super.init(context);
  }
}

module.exports = Static;
