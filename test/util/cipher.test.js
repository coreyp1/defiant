'use strict';

const expect = require('chai').expect;
const Cipher = require('../../').util.Cipher;
const merge = require('../../').util.merge;

describe('Defiant utility class Cipher', () => {
  describe('when performing simple encryption/decryption', () => {
    it('should encrypt text based on a password', () => {
      expect(Cipher.encrypt('foo', 'bar')).to.not.equal('foo');
      expect(Cipher.encrypt('foo', 'bar')).to.not.equal(Cipher.encrypt('foo', 'baz'));
    });
    it('should decrypt text based on a password', () => {
      expect(Cipher.decrypt(Cipher.encrypt('foo', 'bar'), 'bar')).to.equal('foo');
      expect(Cipher.decrypt(Cipher.encrypt('foo', 'bar'), 'baz')).to.not.equal('foo');
    });
  });
  describe('when performing a signed encryption/decryption', () => {
    let password = 'abcdefghijklmnopqrstuvwxyz012345',
        iv = 'abcdefghijkl',
        password2 = 'abcdefghijklmnopqrstuvwxyz01234z',
        iv2 = 'abcdefghijkz',
        result = Cipher.encryptSigned('foo', 'bar', password, iv),
        result2 = Cipher.encryptSigned('', 'bar', password, iv),
        result3 = Cipher.encryptSigned('foo', '', password, iv);
    it('should encrypt based on a password and iv', () => {
      expect(result).to.be.an('object');
      expect(result.content).to.not.equal('foo');
      expect(result).to.eql(Cipher.encryptSigned('foo', 'bar', password, iv));
      expect(result).to.not.eql(Cipher.encryptSigned('foo', 'bar', password, iv2));
      expect(result).to.not.eql(Cipher.encryptSigned('foo', 'bar', password2, iv));
      expect(result).to.not.eql(Cipher.encryptSigned('foo', 'bar', password2, iv2));
    });
    it('should decrypt based on a password and iv', () => {
      expect(Cipher.decryptSigned(result, password, iv)).to.equal('foo');
      expect(Cipher.decryptSigned(result, password, iv2)).to.not.equal('foo');
      expect(Cipher.decryptSigned(result, password2, iv)).to.not.equal('foo');
      expect(Cipher.decryptSigned(result, password2, iv2)).to.not.equal('foo');
    });
    it('should allow for an empty ciphertext', () => {
      expect(Cipher.decryptSigned(result2, password, iv)).to.equal('');
    });
    it('should allow for an empty plaintext', () => {
      expect(Cipher.decryptSigned(result3, password, iv)).to.equal('foo');
    });
    it('should fail decryption when the encrypted text changes', () => {
      expect(Cipher.decryptSigned(merge({}, result, {content: 'X'}), password, iv)).to.be.false;
    });
    it('should fail decryption when the plain text changes', () => {
      expect(Cipher.decryptSigned(merge({}, result, {aad: 'X'}), password, iv)).to.be.false;
    });
    it('should fail decryption when the authorization text (tag) changes', () => {
      expect(Cipher.decryptSigned(merge({}, result, {tag: 'X'}), password, iv)).to.be.false;
    });
  });
  describe('when performing a hash', () => {
    it('should hash the content', () => {
      let hash = Cipher.hash('foo');
      expect(hash).to.equal('LCa0a2j/xo/5m0U8HTBBNBNCLXBkg7+g+YpeiGJm564=');
    });
  });
});
