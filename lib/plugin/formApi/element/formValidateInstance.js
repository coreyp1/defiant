"use strict";

const HiddenInstance = require('./hiddenInstance');
const Cipher = require('../../../util/cipher');

/**
 * A form element to serve the specialized purpose of validating forms.
 *
 * This element will automatically be added to every form.
 *
 * This element should not be altered, with the consequence that the site
 * security may be compromised or broken.
 * @class
 * @extends Defiant.Plugin.FormApi.HiddenInstance
 * @memberOf Defiant.Plugin.FormApi
 */
class FormValidateInstance extends HiddenInstance {
  /**
   * When this function is finished, then the form should be ready to
   * be rendered as a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
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
