"use strict";

const expect = require('chai').expect;
const Defiant = require('../../../');
const Registry = Defiant.util.Registry;
const Item = Defiant.Plugin.Router.Item;

describe('Plugin.Router.Item', () => {
  describe('uninstantiated object', () => {
  });

  describe('when instantiated', () => {
    it('should be initialized with an empty route and subquery', () => {
      let routerItem = new Item();
      expect(routerItem.handlerRegistry).to.be.an.instanceof(Registry);
      expect(routerItem.subquery).to.be.an.instanceof(Map);
      expect(routerItem.subquery.size).to.equal(0);
    });
  });

  describe('when storing handlers', () => {
    it('should add and retrieve a base-path handler', () => {
      let routerItem = new Item(),
          obj = {id: 1, path: ''};
      expect(routerItem.addHandler(obj).collectHandlers('')[0]).to.equal(obj);
    });

    it('should add and retrieve a recursively-placed handler', () => {
      let routerItem = new Item(),
          obj = {id: 1, path: 'a'};
      expect(routerItem.addHandler(obj).collectHandlers('a')[0]).to.equal(obj);
    });

    it('should ignore handlers with unassociated paths', () => {
      let obj1 = {id: 1, path: 'a'},
          obj2 = {id: 2, path: 'b'},
          routerItem = new Item().addHandler(obj1).addHandler(obj2),
          handlers = routerItem.collectHandlers('a');
      expect(handlers.length).to.equal(1);
      expect(handlers[0]).to.equal(obj1);
    });

    it('should add and retrieve wildcard handlers', () => {
      let routerItem = new Item(),
          obj = {id: 1, path: '*'};
      expect(routerItem.addHandler(obj).collectHandlers('a')[0]).to.equal(obj);
      expect(routerItem.addHandler(obj).collectHandlers('a/b')[0]).to.equal(obj);
    });

    it('should omit unrelated wildcard handlers', () => {
      let obj = {id: 1, path: 'a/*/d'},
          routerItem = new Item().addHandler(obj),
          handlers = routerItem.collectHandlers('a/b/c');
      expect(handlers.length).to.equal(0);
    });

    it('should combine explicit and wildcard handlers', () => {
      let obj1 = {id: 1, path: 'a/*'},
          obj2 = {id: 2, path: 'a/b'},
          obj3 = {id: 3, path: '*'},
          routerItem = new Item()
            .addHandler(obj1)
            .addHandler(obj2)
            .addHandler(obj3),
          handlers = routerItem.collectHandlers('a/b/c');
      expect(handlers.length).to.equal(3);
    });
  });

  describe('when sorting handlers', () => {
    it('should respect the given weights of the handlers', () => {
      let obj1 = {id: 1, path: '', weight: 3},
          obj2 = {id: 2, path: '', weight: 2},
          obj3 = {id: 3, path: '', weight: 1},
          routerItem = new Item()
            .addHandler(obj1)
            .addHandler(obj2)
            .addHandler(obj3);
      expect(Item.sortHandlers(routerItem.collectHandlers(''))).to.eql([obj3, obj2, obj1]);
    });

    it('should order by strength of url match when weights are otherwise equal', () => {
      let paths = ['*/*/*/*', '*/*/*/d', '*/*/c/*', '*/*/c/d',
                   '*/b/*/*', '*/b/*/d', '*/b/c/*', '*/b/c/d',
                   'a/*/*/*', 'a/*/*/d', 'a/*/c/*', 'a/*/c/d',
                   'a/b/*/*', 'a/b/*/d', 'a/b/c/*', 'a/b/c/d'],
          expectedOrder = [15,14,13,11,12,10,9,7,8,6,5,3,4,2,1,0],
          objs = paths.map((p, i) => ({id: i, path: p})),
          routerItem = new Item();
      objs.map(obj => routerItem.addHandler(obj));
      let handlers = routerItem.collectHandlers('a/b/c/d/e');
      expect(Item.sortHandlers(handlers).map(h => h.path)).to.eql(expectedOrder.map(i => paths[i]));
    });

    it('should properly sort handlers of mixed weight and url strength', () => {
      let obj1 = {id: 1, path: 'a/*', weight: 0},
          obj2 = {id: 2, path: 'a/b', weight: 0},
          obj3 = {id: 3, path: 'a/*', weight: 3},
          obj4 = {id: 4, path: 'a/b/c', weight: 3},
          routerItem = new Item()
            .addHandler(obj1)
            .addHandler(obj2)
            .addHandler(obj3)
            .addHandler(obj4),
          handlers = routerItem.collectHandlers('a/b/c');
      expect(Item.sortHandlers(handlers)).to.eql([obj2, obj1, obj4, obj3]);
    });
  });

  describe('when parsing Urls', () => {
    it('should ignore extra slashes', () => {
      let obj1 = {id: 1, path: 'a', weight: 0},
          obj2 = {id: 2, path: 'a/b', weight: 0},
          routerItem = new Item()
            .addHandler(obj1)
            .addHandler(obj2);
          expect(routerItem.collectHandlers('/a').length).to.equal(1);
          expect(routerItem.collectHandlers('a//b').length).to.equal(2);
          expect(routerItem.collectHandlers('a/b/').length).to.equal(2);
          expect(routerItem.collectHandlers('//a///b///').length).to.equal(2);
    });
  });
});
