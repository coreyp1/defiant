"use strict";

const Plugin = require('../plugin');
const Container = require('./renderables/container');

class Message extends Plugin {
  constructor(engine) {
    super(engine);

    // Add the Container renderable.
    engine.plugin.get('ThemeBase').setRenderable(Container);

    // Add the MessageHandler to the Router.
    engine.plugin.get('Router').router.addHandler(require('./handler/messageHandler'));
  }
}

module.exports = Message;
