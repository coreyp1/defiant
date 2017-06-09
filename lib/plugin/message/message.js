"use strict";

const Plugin = require('../plugin');
const Container = require('./renderables/container');

class Message extends Plugin {
  constructor(engine) {
    super(engine);

    // Add the Container renderable.
    engine.pluginRegistry.get('ThemeBase')
      .setRenderable(Container)
      .setRenderable(require('./widget/messageWidget'));

    // Add the Message Widget.
    engine.pluginRegistry.get('Layout').widgetRegistry.set(new (require('./widget/messageWidget'))());

    // Add the MessageHandler to the Router.
    engine.pluginRegistry.get('Router').addHandler(new (require('./handler/messageHandler'))());
  }
}

module.exports = Message;
