"use strict";

const expect = require('chai').expect;
const Defiant = require('../../');
const Plugin = Defiant.Plugin;

describe('Defiant Plugin base class', () => {
  describe('when instantiated', () => {
    it('saves the provided Engine object', () => {
      let obj = {},
          plugin = new Plugin('foo', obj);
      expect(plugin.engine).to.eql(obj);
    });
  });
});
