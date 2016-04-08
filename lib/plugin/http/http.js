'use strict';

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const http = require('http');
const Connect = require('connect');
const {coroutine: co} = require('bluebird');

class Http extends Plugin {
  constructor(engine) {
    super(engine);
    // Create the engine registries for Http.
    engine.registry.http = {
      incoming: new Registry(),
    };
    // Add this as an instance of Connect middleware.
    this.connect = Connect();
    this.connect.use((...args) => this.incoming(...args));
    this.http = http.createServer(this.connect);
  }

  init() {
    return co(function* (self) {
      self.http.listen(8888, () => console.log('Server has started'))
    })(this);
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
