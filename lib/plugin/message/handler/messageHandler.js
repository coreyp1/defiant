"use strict";

const Handler = require('../../router/handler');

class MessageHandler extends Handler {
  async init(context) {
    if (!context.volatile.message) {
      context.volatile.message = new (context.theme.getRenderable('Container'))(context);
    }
  }
}

MessageHandler.id = 'Message.MessageHandler';
MessageHandler.path = '';
MessageHandler.weight = -525;

module.exports = MessageHandler;
