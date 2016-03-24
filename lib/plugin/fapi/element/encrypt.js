"use strict";

const Hidden = require('./hidden');
const Cipher = require('../../../util/cipher');

class Encrypt extends Hidden {
  init(context, data) {
    data = data || {};

    // perform any needed alterations to {data.value} in preparation for render
    let ivCounter = this.form.getNextIVCounter().toString(),
        encrypted = Cipher.encryptSigned(JSON.stringify(data.value), '', context.request.session.fapikeyraw,  this.form.getIV(this.name + ivCounter));
    data.value = [ivCounter, encrypted.tag, encrypted.content];

    return super.init(context, data);
  }
}

module.exports = Encrypt;
