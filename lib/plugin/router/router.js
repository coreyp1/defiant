"use strict";

const RouterItem = require('./routerItem');
const Handler = require('./handler');
const Plugin = require('../plugin');

class Router extends Plugin {
  constructor(engine) {
    super(engine);
    this.router = new RouterItem();
    return this;
  }
}

Router.RouterItem = RouterItem;
Router.Handler = Handler;

module.exports = Router;
