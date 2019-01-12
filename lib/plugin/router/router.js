"use strict";

const Item = require('./item');
const Handler = require('./handler');
const Plugin = require('../plugin');
const url = require('url');

class Router extends Plugin {
  constructor(engine) {
    super(engine);
    engine.pluginRegistry.get('Http').incomingRegistry.set({id: 'router', incoming: (...args) => this.incoming(...args)});
    this.router = new Item();
    return this;
  }

  async init() {
    this.addHandler(new (require('./handler/accessDeniedHandler'))())
      .addHandler(new (require('./handler/notFoundHandler'))());
  }
  
  addHandler(handler) {
    this.router.addHandler(handler);
    let Menu = this.engine.pluginRegistry.get('Menu');
    Menu.addHandler(handler);
    return this;
  }

  async incoming(context) {
    // Tokenize the URL.
    context.request.urlTokenized = context.request._parsedUrl.pathname.split('/').map(path => path.trim()).filter(path => path !== '');
    // TODO: Proper favicon.ico handling.
    if (context.request.urlTokenized.length == 1 && context.request.urlTokenized[0] == 'favicon.ico') {return;}
    let handlers = Item.sortHandlers(this.router.collectHandlers(context.request.urlTokenized));
    for (let key in handlers) {
      if (context.httpResponse === undefined || handlers[key].alwaysProcess) {
        if (await handlers[key].allowAccess(context)) {
          // Set the page title.
          if (handlers[key].menu && handlers[key].menu.text) {
            context.page.title = handlers[key].menu.text;
          }
          // Process the handler.
          await handlers[key].init(context);
        }
      }
    }
  }
}

module.exports = Router;
