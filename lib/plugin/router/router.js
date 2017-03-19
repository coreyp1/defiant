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

  incoming(context) {
    // TODO: Proper favicon.ico handling.
    if (context.request.url == '/favicon.ico') {return Promise.resolve();}
    let handlers = Item.sortHandlers(this.router.collectHandlers(context.request._parsedUrl.pathname));
    return co(function*() {
      for (let handler of handlers) {
        if (context.httpResponse == undefined) {
          yield (new handler()).init(context);
        }
      }
    })();
  }
}

module.exports = Router;
