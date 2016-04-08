'use strict';

const expect = require('chai').expect;
const isEmptyObject = require('../../').util.isEmptyObject;

describe('Defiant utility isEmptyObject()', () => {
  it('should return false if argument is not an object', () => {
    expect(isEmptyObject(5)).to.be.false;
  });
  it('should return true if the argument is an empty object', () => {
    expect(isEmptyObject({})).to.be.true;
  });
  it('should return false if the argument is an object but not empty', () => {
    expect(isEmptyObject({foo: 'bar'})).to.be.false;
  });
  it('should recognize arrays as objects', () => {
    expect(isEmptyObject([])).to.be.true;
    expect(isEmptyObject([5])).to.be.false;
  });
});
