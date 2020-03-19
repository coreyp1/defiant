'use strict';

const crypto = require('crypto');

/**
 * Provide a set of tools to handle consistent encrypting and decrypting of text
 * using symmetric-key as well as streaming ciphers.
 * @example
 * crypto.randomBytes(12, function(ex, buf) {
 *   let a = 'foo';
 *   let b = cipher.encryptSigned(a, password, buf);
 *   console.log(a);
 *   console.log(b);
 *   console.log(cipher.decryptSigned(b, password, buf));
 * });

 * @class
 * @memberOf Defiant.util
 */
class Cipher {
  /**
   * Perform a symmetric key encryption of `plaintext` using `password`.
   * @function
   * @param {String} plaintext The text to be encrypted.
   * @param {String} password A password to use in the encryption.
   * @returns {String} The encrypted text.
   */
  static encrypt(plaintext, password) {
    let cipher = crypto.createCipher(Cipher.algorithm, password);
    let encrypted = cipher.update(plaintext, 'utf8', Cipher.encoding);
    encrypted += cipher.final(Cipher.encoding);
    return encrypted;
  }

  /**
   * Perform a symmetric key decryption of `encrypted` using `password`.
   * @function
   * @param {String} encrypted The text to be decrypted.
   * @param {String} password The password to use in the decryption.
   * @returns {String} The decrypted text.
   */
  static decrypt(encrypted, password) {
    let decipher = crypto.createDecipher(Cipher.algorithm, password);
    let decrypted = decipher.update(encrypted, Cipher.encoding, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * @typedef Defiant.util.Cipher.EncryptedOjbect
   * @prop {String} content The encrypted text.
   * @prop {String} aad The unencrypted text that was signed.
   * @prop {String} tag A Base64 encoded string which signs `content` and
   *   `aad`.
   */
   /**
    * @typedef Defiant.util.Cipher.EncryptedOjbectBuffered
    * @prop {String} content The encrypted text.
    * @prop {Buffer} aad The unencrypted text that was signed.
    * @prop {Buffer} tag A Base64 encoded string which signs `content` and
    *   `aad`.
    */
  /**
   * Perform a streaming symmetric key encryption with a signed value and
   * initialization vector.  Converts strings to buffers and calls
   * {@link Defiant.util.Cipher.encryptSignedBuffered}.
   *
   * WARNING: NEVER REUSE THE SAME `iv` AND `password` PAIR TWICE.
   *
   * See {@link https://en.wikipedia.org/wiki/Stream_cipher_attacks}.
   * @function
   * @param {String} toEncrypt Text which should be encrypted and signed.
   * @param {String} doNotEncrypt Text which should be signed but not encrypted.
   * @param {String} password Must be 32 characters, binary.
   * @param {String} iv Must be 12 characters.
   * @returns {Defiant.util.Cipher.EncryptedOjbect} If encryption succeeds.
   * @returns {Boolean} `false` if encryption fails.
   */
  static encryptSigned(toEncrypt, doNotEncrypt, password, iv) {
    return Cipher.encryptSignedBuffered(toEncrypt, doNotEncrypt ? Buffer.from(doNotEncrypt) : false, Buffer.from(password, 'binary'), Buffer.from(iv));
  }

  /**
   * Perform a streaming symmetric key encryption with a signed value and
   * initialization vector.  Used by {@link Defiant.util.Cipher.encryptSigned}.
   *
   * WARNING: NEVER REUSE THE SAME `iv` AND `password` PAIR TWICE.
   *
   * See {@link https://en.wikipedia.org/wiki/Stream_cipher_attacks}.
   * @function
   * @param {String} toEncrypt Text which should be encrypted and signed.
   * @param {Buffer} doNotEncrypt Text which should be signed but not encrypted.
   * @param {Buffer} password Must be 32 characters, binary.
   * @param {Buffer} iv Must be 12 characters.
   * @returns {Defiant.util.Cipher.EncryptedOjbect} If encryption succeeds.
   * @returns {Boolean} `false` if encryption fails.
   */
  static encryptSignedBuffered(toEncrypt, doNotEncrypt, password, iv) {
    try {
      let cipher = crypto.createCipheriv(Cipher.algorithmSigned, password, iv);
      if (doNotEncrypt) {
        cipher.setAAD(doNotEncrypt);
      }
      let encrypted = cipher.update(toEncrypt, 'utf8', Cipher.encoding);
      encrypted += cipher.final(Cipher.encoding);
      let tag = cipher.getAuthTag();
      return {
        content: encrypted,
        aad: doNotEncrypt,
        tag: tag.toString('base64')
      };
    }
    catch (e) {
      return false;
    }
  }

  /**
   * Perform a streaming symmetric key decryption with a signed value and
   * initialization vector.  Converts strings to buffers and calls
   * {@link Defiant.util.Cipher.decryptSignedBuffered}.
   * @function
   * @param {Defiant.util.Cipher.EncryptedOjbect} encrypted Text which should
   *   be decrypted.
   * @param {String} password Must be 32 characters, binary.
   * @param {String} iv Must be 12 characters.
   * @returns {String} If encryption succeeds, return the decrypted text.
   * @returns {Boolean} `false` if decryption fails.
   */
  static decryptSigned(encrypted, password, iv) {
    try {
      return Cipher.decryptSignedBuffered({
        aad: encrypted.aad ? Buffer.from(encrypted.aad) : '',
        tag: Buffer.from(encrypted.tag, Cipher.encoding),
        content: encrypted.content
      }, Buffer.from(password, 'binary'), Buffer.from(iv));
    }
    catch (e) {
      return false;
    }
  }

  /**
   * Perform a streaming symmetric key decryption with a signed value and
   * initialization vector.  Used by {@link Defiant.util.Cipher.decryptSigned}.
   * @function
   * @param {Defiant.util.Cipher.EncryptedOjbectBuffered} encrypted Text which
   *   should be decrypted.
   * @param {Buffer} password Must be 32 characters, binary.
   * @param {Buffer} iv Must be 12 characters.
   * @returns {String} If encryption succeeds, return the decrypted text.
   * @returns {Boolean} `false` if decryption fails.
   */
  static decryptSignedBuffered(encrypted, password, iv) {
    try {
      if ([4, 8, 12, 13, 14, 15, 16].indexOf(encrypted.tag.length) == -1) {
        // `tag` is not the correct length.
        return false;
      }
      let decipher = crypto.createDecipheriv(Cipher.algorithmSigned, password, iv);
      if (encrypted.aad) {
        decipher.setAAD(encrypted.aad);
      }
      decipher.setAuthTag(encrypted.tag);
      let decrypted = decipher.update(encrypted.content, Cipher.encoding, 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }
    catch (e) {
      return false;
    }
  }

  /**
   * Create a `sha256` hash from `plaintext`.
   * @function
   * @param {string} plaintext The text to be hased.
   * @returns {string} The `sha265` hash of `plaintext`.
   */
  static hash (plaintext) {
    let shasum = crypto.createHash('sha256');
    shasum.update(plaintext);
    return shasum.digest(Cipher.encoding);
  }
}

/**
 * @static
 * @member {String} Defiant.util.Cipher.algorithm The algorithm used for
 * symmetric cyphers.
 */
Cipher.algorithm = 'aes-256-cfb';
/**
 * @static
 * @member {String} Defiant.util.Cipher.algorithmSigned The algorithm used for
 * streaming symmetric cyphers.  Uses Galois/Counter Mode.
 */
Cipher.algorithmSigned = 'aes-256-gcm';
/**
 * @static
 * @member {String} Defiant.util.Cipher.encoding The text format to use for
 * binary data.
 */
Cipher.encoding = 'base64';

module.exports = Cipher;
