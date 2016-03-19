"use strict";

const expect = require('chai').expect;
const range = require('../../').util.range;

describe('Defiant utility range()', () => {
  describe('when invoked', () => {
    it('should return an iterator of values 0...3', () => {
      expect(Array.from(range(3))).to.eql([0,1,2,3]);
    });
    it('should return an iterator of values 2...5', () => {
      expect(Array.from(range(2,5))).to.eql([2,3,4,5]);
    });
    it('should return an iterator of no values for negative input', () => {
      expect(Array.from(range(-1))).to.be.empty;
    });
    it('should return an iterator of no values for no input', () => {
      expect(Array.from(range())).to.be.empty;
    });
    it('should return an iterator of no values for switched input (min > max)', () => {
      expect(Array.from(range(5,2))).to.be.empty;
    });
  });
  describe('when given to Array.from()', () => {
    it('should export to an array', () => {
      expect(Array.from(range(5))).to.eql([0,1,2,3,4,5]);
    })
  })
});
