"use strict";

const RouterItem = require('./routerItem');
const Handler = require('./handler');
const Plugin = require('../plugin');
const url = require('url');

class Router extends Plugin {
  constructor(engine) {
    super(engine);
    this.id = 'router';
    engine.registry.http.incoming.set({id: 'http', incoming: (...args) => this.incoming(...args)});
    this.router = new RouterItem();
    return this;
  }

  incoming(request, response, next) {
    if (request.url == '/favicon.ico') {return next();}
    let handlers = RouterItem.sortHandlers(this.router.collectHandlers(request._parsedUrl.pathname)),
        current = 0,
        context = {
          request,
          response,
          next: doNext,
          engine: this.engine,
          status: undefined,
        };
    function doNext() {
      if ((context.status == undefined) && (current < handlers.length)) {
        handlers[current++].process(context);
      }
      else {
        response.setHeader("Content-Type", 'text/html');
        response.write('Howdy!');
        response.end();
        //next();
      }
    }
    doNext();
  }
}

Router.RouterItem = RouterItem;
Router.Handler = Handler;

module.exports = Router;
