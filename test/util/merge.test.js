'use strict';

const expect = require('chai').expect;
const merge = require('../../').util.merge;

describe('Defiant utility merge()', () => {
  describe('when there is only one argument', () => {
    it('should return the first argument', () => {
      expect(merge(5)).to.equal(5);
    });
  });
  describe('when there are two arguments', () => {
    describe('and the first object is falsey', () => {
      it('should return the second object', () => {
        expect(merge(null, {})).to.eql({});
      });
    });
    describe('and the type of the two arguments does not match', () => {
      it('should return the second argument', () => {
        expect(merge([], 5)).to.equal(5);
      });
    });
    describe('and the second argument is null', () => {
      it('should return null', () => {
        expect(merge({}, null)).to.be.null;
      });
    });
    describe('and both arguments are arrays', () => {
      it('should return a concatenation the arrays', () => {
        expect(merge([0, 5], [3, 8])).to.eql([0, 5, 3, 8]);
      });
    });
    describe('and both arguments are objects', () => {
      it('should merge the second argument into the first', () => {
        expect(merge({a:1, b:2}, {b:3, c:4})).to.eql({a:1, b:3, c:4});
      });
    });
    describe('and both arguments are objects with deeply-nested values', () => {
      it('should recursively merge the keys in common', () => {
        expect(merge({a: {b: {c: {foo: 'bar'}}}}, {a: {b: {c: {baz: 'qux'}}}})).to.eql({a: {b: {c: {foo: 'bar', baz: 'qux'}}}});
      })
    })
  });
  describe('when there are more than two arguments', () => {
    it('should merge all arguments into the first argument sequentially', () => {
      expect(merge({a:1}, {b:2, c:3}, {b:4})).to.eql({a:1, b:4, c:3});
    });
  });
});
