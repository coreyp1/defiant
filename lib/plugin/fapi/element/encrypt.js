"use strict";

const Hidden = require('./hidden');
const Cipher = require('../../../util/cipher');

class Encrypt extends Hidden {
  init(context, data) {
    data = data || {};

    // perform any needed alterations to {data.value} in preparation for render
    this.ivCounter = this.form.getNextIVCounter().toString();
    this.encrypted = Cipher.encryptSigned(JSON.stringify(data.value), '', context.request.session.fapikeyraw,  this.form.getIV(this.name + this.ivCounter));
    data.value = this.encrypted.content;

    return super.init(context, data);
  }
}

module.exports = Encrypt;