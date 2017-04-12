"use strict";

const Item = require('./item');
const Handler = require('./handler');
const Plugin = require('../plugin');
const url = require('url');
const {coroutine: co} = require('bluebird');

class Router extends Plugin {
  constructor(engine) {
    super(engine);
    engine.registry.http.incoming.set({id: 'http', incoming: (...args) => this.incoming(...args)});
    this.router = new Item();
    return this;
  }

  init() {
    this.router.addHandler(new (require('./handler/accessDeniedHandler'))());
    return Promise.resolve();
  }

  incoming(context) {
    // Tokenize the URL.
    context.request.urlTokenized = context.request._parsedUrl.pathname.split('/').filter(path => path !== '');
    // TODO: Proper favicon.ico handling.
    if (context.request.urlTokenized.length == 1 && context.request.urlTokenized[0] == 'favicon.ico') {return Promise.resolve();}
    let handlers = Item.sortHandlers(this.router.collectHandlers(context.request.urlTokenized));
    return co(function*() {
      for (let key in handlers) {
        if (context.httpResponse === undefined || handlers[key].alwaysProcess) {
          if (yield handlers[key].canAccess(context)) {
            yield handlers[key].init(context);
          }
        }
      }
    })();
  }
}

module.exports = Router;
