"use strict";

const assert = require('chai').assert;
const Defiant = require('../');

describe('Defiant', () => {
  describe('base object', () => {
    it('should contain object Defiant.util', () => {
      assert.isObject(Defiant.util);
    });
    it('should contain Plugin function', () => {
      assert.isFunction(Defiant.Plugin);
    });
  });
});
