'use strict';

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const http = require('http');
const Connect = require('connect');

class Http extends Plugin {
  constructor(engine) {
    super(engine);

    // Create a registry for incoming Http connections.
    this.incomingRegistry = new Registry();

    // Add this as an instance of Connect middleware.
    this.connect = Connect();
    this.connect.use((...args) => this.incoming(...args));
    this.http = http.createServer(this.connect);
  }

  async init() {
    this.http.listen(8888, () => console.log('Server has started'))
  }

  async incoming(request, response, next) {
    let elements = this.incomingRegistry.getOrderedElements(),
        context = {request, response, engine: this.engine, httpResponse: undefined};
    for (let element of elements) {
      if (context.httpResponse != undefined) {
        break;
      }
      await element.incoming(context);
    }
    if (context.httpResponse !== undefined) {
      let wait = context.httpResponse.commit(context);
      if ((typeof wait === 'object') && (wait.constructor.name === 'Promise')) {
        await wait;
      }
    }
    else {
      next();
    }
  }
}

module.exports = Http;
