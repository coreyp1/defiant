"use strict";

const expect = require('chai').expect;
const Defiant = require('../');

describe('Defiant', () => {
  describe('base object', () => {
    it('should contain object Defiant.util', () => {
      expect(Defiant.util).isObject;
    });
    it('should contain Plugin class', () => {
      expect(Defiant.Plugin).isObject;
    });
  });
});
