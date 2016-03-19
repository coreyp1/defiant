"use strict";

const expect = require('chai').expect;
const Defiant = require('../../')
const Registry = Defiant.util.Registry;
const range = Defiant.util.range;

describe("Defiant Registry class", () => {
  describe("when setting and retrieving registry entry", () => {
    it("should return undefined for unset keys", () => {
      let registry = new Registry();
      expect(registry.get(undefined)).to.be.undefined;
    });

    it("should set and retrieve the same object", () => {
      let registry = new Registry(),
          obj = {id: 'foo'};
      expect(obj).to.equal(registry.set(obj).get(obj.id))
    });
  });

  describe('id functionality', () => {
    it('should allow a custom ID parameter', () => {
      let registry = new Registry({useId: 'customId'});
      Array.from(range(10)).map(x => registry.set({customId: x}));
      expect(registry.getOrderedKeys().length).to.equal(11);
    });
  });

  describe('weight functionality', () => {
    it('should recognize the default weight function, if present', () => {
      let registry = new Registry(),
          numbers = Array.from(range(10)),
          offset = Math.floor(numbers.length / 2);
      numbers.map(x => registry.set(x % 2 ? {id: x} : {id: x, weight: 5}))
      expect(registry.getOrderedKeys()).to.eql(numbers.map(x => x < offset ? (x * 2) + 1 : (x - offset) * 2));
    });

    it("should allow customization of the weight parameter name", () => {
      let registry = new Registry({useWeight: 'foo'}),
          numbers = Array.from(range(5));
      numbers.map(x => registry.set({id: x, foo: numbers.length - x}))
      expect(registry.getOrderedKeys()).to.eql(numbers.reverse());
    });

    it('should return objects in order', () => {
      let registry = new Registry(),
          objects = [];
      Array.from(range(5)).map(x => registry.set(objects[x] = {id: x}));
      expect(registry.getOrderedElements()).to.eql(objects);
    });

    it('should break ties of weight according to the order added', () => {
      let registry = new Registry(),
          numbers = Array.from(range(100));
      numbers.map(x => registry.set({id: x, weight: 5}))
      expect(registry.getOrderedKeys()).to.eql(numbers);
    });
  });

  describe('setting element in Registry', () => {
    it('should clear the getOrderedKeys() cache', () => {
      let registry = new Registry();
      registry.set({id: 'a'});
      registry.getOrderedKeys();
      registry.set({id: 'b', weight: -1});
      expect(registry.getOrderedKeys()[0]).to.equal('b');
    });
  });

  describe('when requesting an iterator over the values in the registry', () => {
    it('should provide an iterator for the values', () => {
      let registry = new Registry();
      registry.set({id: 'a'});
      registry.set({id: 'b'});
      expect(registry.getIterator()).to.be.instanceof(Object);
      expect(Array.from(registry.getIterator()).length).to.equal(2);
    });
  });
});
