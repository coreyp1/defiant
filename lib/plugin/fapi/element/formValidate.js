"use strict";

const Hidden = require('./hidden');
const Cipher = require('../../../util/cipher');

class FormValidate extends Hidden {
  init(context, data) {
    // Perform any needed alterations to {data.value} in preparation for render.
    this.ivCounter = (data.ivCounter !== undefined) ? data.ivCounter : this.form.getNextIVCounter().toString();
    data.static.push(this.ivCounter);
    this.encrypted = Cipher.encryptSigned(JSON.stringify(data.encrypt), JSON.stringify(data.static), context.request.session.fapikeyraw,  this.form.getIV(this.name + this.ivCounter));
    data.value = JSON.stringify([data.static, this.encrypted.content]);

    return super.init(context, data);
  }
}

module.exports = FormValidate;
