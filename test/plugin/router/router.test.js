"use strict";

const expect = require('chai').expect;
const Defiant = require('../../../');
const Router = Defiant.Plugin.Router;

describe('Plugin.Router', () => {
  it('should be after Http in the Engine plugin registry', () => {
    let engine = new Defiant.Engine(),
        plugins = engine.plugin.getOrderedKeys();
    expect(plugins.indexOf('router')).to.be.above(plugins.indexOf('http'));
  });

  describe('before being instantiated', () => {
    it('should reference Item', () => {
      expect(Router.Item).to.not.be.empty;
      expect(new Router.Item()).to.be.an.instanceof(require('../../../lib/plugin/router/item'));
    });

    it('should reference Handler', () => {
      expect(Router.Handler).to.not.be.empty;
      expect(new Router.Handler({}, () => {})).to.be.an.instanceof(require('../../../lib/plugin/router/handler'));
    });
  });

  describe('when instantiated', () => {
  });
});
