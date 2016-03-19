"use strict";

const expect = require('chai').expect;
const Defiant = require('../');

describe('Defiant Engine', () => {
  describe('when instantiated', () => {
    it('should contain Registry at Engine().plugin', () => {
      expect(new Defiant.Engine().plugin).to.be.an.instanceof(Defiant.util.Registry);
    });
  });
});
