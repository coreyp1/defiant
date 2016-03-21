"use strict";

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const http = require('http');
const Connect = require('connect');

class Http extends Plugin {
  constructor(engine) {
    super(engine);
    this.id = 'http';
    // Create the engine registries for Http.
    engine.registry.http = {
      incoming: new Registry(),
    };
    // Add this as an instance of Connect middleware.
    this.connect = Connect();
    this.connect.use((...args) => this.incoming(...args));
    this.http = http.createServer(this.connect);
  }

  listen(port, callback) {
    this.http.listen(port, callback);
    return this;
  }

  incoming(request, response, next) {
    let elements = this.engine.registry.http.incoming.getOrderedElements(),
        current = 0;
    function doNext() {
      if (current < elements.length) {
        elements[current++].incoming(request, response, doNext);
      }
      else {
        next();
      }
    }
    doNext();
  }
}

module.exports = Http;
