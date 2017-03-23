"use strict";

const Plugin = require('../plugin');
const Container = require('./renderables/container');

class Message extends Plugin {
  constructor(engine) {
    super(engine);

    // Add the Container renderable.
    engine.plugin.get('ThemeBase').setRenderable(Container);

    // Add the Message Widget.
    engine.plugin.get('Layout').widgets.set(require('./widget/messageWidget'));

    // Add the MessageHandler to the Router.
    engine.plugin.get('Router').router.addHandler(require('./handler/messageHandler'));
  }
}

module.exports = Message;
