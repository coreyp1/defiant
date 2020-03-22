"use strict";

const HiddenInstance = require('./hiddenInstance');
const Cipher = require('../../../util/cipher');

/**
 * An instance of a Hidden HTML form element whose value cannot be changed by
 * the receiver.
 *
 * The value held by this hidden element is cryptographically signed so that it
 * may not be changed, exchanged, or omitted without invalidating the form.
 * @class
 * @extends Defiant.Plugin.FormApi.HiddenInstance
 * @memberOf Defiant.Plugin.FormApi
 */
class StaticInstance extends HiddenInstance {
  /**
   * When this function is finished, then the form should be ready to
   * be rendered as a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
  async init(data={}) {
    await super.init(data);

    // Compute cryptographic signing.
    this.ivCounter = this.formInstance.getNextIVCounter().toString();
    this.encrypted = Cipher.encryptSigned('', this.data.value, this.context.session.formApiKeyRaw,  this.formInstance.getIV(this.name + this.ivCounter));
  }
}

module.exports = StaticInstance;
