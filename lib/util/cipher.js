'use strict';

const crypto = require('crypto');

class Cipher {

  static encrypt(plaintext, password) {
    let cipher = crypto.createCipher(Cipher.algorithm, password);
    let encrypted = cipher.update(plaintext, 'utf8', Cipher.encoding);
    encrypted += cipher.final(Cipher.encoding);
    return encrypted;
  }

  static decrypt(encrypted, password) {
    let decipher = crypto.createDecipher(Cipher.algorithm, password);
    let decrypted = decipher.update(encrypted, Cipher.encoding, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * password must be 32 characters, binary
   * iv must be 12 characters
   */
  static encryptSigned(toEncrypt, doNotEncrypt, password, iv) {
    return Cipher.encryptSignedBuffered(toEncrypt, doNotEncrypt ? new Buffer(doNotEncrypt) : false, new Buffer(password, 'binary'), new Buffer(iv));
  }

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

  static decryptSigned(encrypted, password, iv) {
    return Cipher.decryptSignedBuffered({
      aad: encrypted.aad ? new Buffer(encrypted.aad) : '',
      tag: new Buffer(encrypted.tag, Cipher.encoding),
      content: encrypted.content
    }, new Buffer(password, 'binary'), new Buffer(iv));
  }

  static decryptSignedBuffered(encrypted, password, iv) {
    try {
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

  static hash (plaintext) {
    let shasum = crypto.createHash('sha256');
    shasum.update(plaintext);
    return shasum.digest(Cipher.encoding);
  }
};

Cipher.algorithm = 'aes-256-ctr';
Cipher.algorithmSigned = 'aes-256-gcm';
Cipher.encoding = 'base64';

module.exports = Cipher;

// crypto.randomBytes(12, function(ex, buf) {
//   let a = 'foo';
//   let b = cipher.encryptSigned(a, password, buf);
//   console.log(a);
//   console.log(b);
//   console.log(cipher.decryptSigned(b, password, buf));
// });
