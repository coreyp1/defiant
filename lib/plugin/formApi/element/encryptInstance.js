"use strict";

const HiddenInstance = require('./hiddenInstance');
const Cipher = require('../../../util/cipher');

/**
 * An instance of a Hidden form element whose value is encrypted and signed.
 *
 * This form element is safe to give to the requester, since it is only valid
 * in this instance of the form, protected by the session hidden key and the
 * form's unique ivBase.  The requester cannot modify the value, switch the
 * values, or omit the values from the form without causing the form validation
 * to fail.
 *
 * A common use for this type of element is to give the user some information
 * that Defiant does not want or need to store in the database, but that the
 * user must submit back with the form.  This will remove a significant storage
 * burden from the Defiant database.
 * @class
 * @extends Defiant.Plugin.FormApi.HiddenInstance
 * @memberOf Defiant.Plugin.FormApi
 */
class EncryptInstance extends HiddenInstance {
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
    this.plainText = this.data.value;
    this.ivCounter = this.formInstance.getNextIVCounter().toString();
    this.encrypted = Cipher.encryptSigned(this.plainText, '', this.context.session.formApiKeyRaw, this.formInstance.getIV(this.name + this.ivCounter));
    this.data.value = this.encrypted.content;

    await super.init(data);
  }

  /**
   * Perform the form validations for this particular element and its child
   * elements.
   *
   * All encryptions are cryptographically signed so that it cannot be changed
   * or swapped out with the content from another form.  If this cryptographic
   * signing fails validation, then the form validation will also fail.
   * @function
   * @async
   */
  async validate() {
    if (this.validated) {
      // Don't double-decrypt.
      return;
    }

    // Gather the variables necessary to decrypt the posted information.
    let post = (this.context.post && this.context.post[this.formInstance.id]) ? this.context.post[this.formInstance.id] : {};
    let encryptKeys = (this.context.post && this.context.post.encryptKeys) ? this.context.post.encryptKeys : {};
    let formValidate = encryptKeys[this.name] || {};

    // Put the decrypted information into the post variable.
    let value = (post && post[this.name]) ? post[this.name] : undefined;

    // Perform the decryption.
    if (value && (typeof value === 'string')) {
      value = Cipher.decryptSigned({tag: formValidate.t, aad: '', content: value}, this.context.session.formApiKeyRaw, this.formInstance.getIV(this.name + formValidate.c));
      if (value !== false) {
        // The decryption was successful.
        post[this.name] = value;
      }
      else {
        // TODO: Translate.
        this.formInstance.setError('decryptFailed', 'There was an error while trying to decrypt some of the form.');
      }
    }

    this.validated = true;

    await super.validate();
  }
}

module.exports = EncryptInstance;
