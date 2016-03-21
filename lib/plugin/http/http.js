"use strict";

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const http = require('http');
const Connect = require('connect');
const {coroutine: co} = require('bluebird');

class Http extends Plugin {
  constructor(engine) {
    super('http', engine);
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
        context = {request, response, engine: this.engine, httpResponse: undefined};
    co(function*() {
      for (let element of elements) {
        yield element.incoming(context);
      }
      (context.httpResponse != undefined) ? context.httpResponse.commit() : next();
    })();
  }
}

module.exports = Http;
