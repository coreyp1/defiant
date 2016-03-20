"use strict";

const expect = require('chai').expect;
const Defiant = require('../../');
const PluginRegistry = Defiant.util.PluginRegistry;
const Plugin = Defiant.Plugin;

describe('PluginRegistry', () => {
  describe('when adding item to the registry', () => {
    it('should initialize the item with a reference to Engine', () => {
      let pluginRegistry = new PluginRegistry(),
          engine = {};
      expect(pluginRegistry.set(Plugin, engine).get(undefined).engine).to.equal(engine);
    })
  })
})
