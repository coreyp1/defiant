"use strict";

const Plugin = require('../plugin');
const Container = require('./renderables/container');

class Message extends Plugin {
  constructor(engine) {
    super(engine);
    engine.registry.http.incoming.set({id: 'message', weight: -600, incoming: (...args) => this.incoming(...args)});
  }

  incoming(context) {
    context.message = new Container();
    return Promise.resolve();
  }
}

module.exports = Message;
