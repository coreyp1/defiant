"use strict";

const expect = require('chai').expect;
const Defiant = require('../../../');
const Router = Defiant.Router;

describe('Defiant Class Router', () => {
  describe('before being instantiated', () => {
    it('should reference RouterItem', () => {
      expect(Router.RouterItem).to.not.be.empty;
      expect(new Router.RouterItem()).to.be.an.instanceof(require('../../../lib/plugin/router/routerItem'));
    });

    it('should reference Handler', () => {
      expect(Router.Handler).to.not.be.empty;
      expect(new Router.Handler()).to.be.an.instanceof(require('../../../lib/plugin/router/handler'));
    })
  });

  describe('when instantiated', () => {
  });
});
