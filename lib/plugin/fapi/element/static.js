"use strict";

const Hidden = require('./hidden');
const Cipher = require('../../../util/cipher');

class Static extends Hidden {
  init(context, data) {
    data = data || {};

    // perform any needed alterations to {data.value} in preparation for render
    this.ivCounter = this.form.getNextIVCounter().toString();
    this.encrypted = Cipher.encryptSigned('', data.value, context.request.session.fapikeyraw,  this.form.getIV(this.name + this.ivCounter));

    return super.init(context, data);
  }
}

module.exports = Static;
