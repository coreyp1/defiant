"use strict";

const Item = require('./item');
const Handler = require('./handler');
const Plugin = require('../plugin');
const url = require('url');

class Router extends Plugin {
  constructor(engine) {
    super('router', engine);
    engine.registry.http.incoming.set({id: 'http', incoming: (...args) => this.incoming(...args)});
    this.router = new Item();
    return this;
  }

  incoming(context, next) {
    if (context.request.url == '/favicon.ico') {return next();}
    let handlers = Item.sortHandlers(this.router.collectHandlers(context.request._parsedUrl.pathname)),
        current = 0;
    function doNext() {
      if ((context.status == undefined) && (current < handlers.length)) {
        new handlers[current++](context, doNext);
      }
      else {
        if (context.httpResponse == undefined) {
          context.response.setHeader("Content-Type", 'text/html');
          context.response.write('Howdy!');
          context.response.end();
        }
        else {
          return next();
        }
      }
    }
    doNext();
  }
}

module.exports = Router;
