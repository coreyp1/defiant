"use strict";

const Handler = require('../../router/handler');

class MessageHandler extends Handler {
  init(context) {
    if (!context.volatile.message) {
      context.volatile.message = new (context.theme.getRenderable('Container'))(context);
    }
    return Promise.resolve();
  }
}

MessageHandler.id = 'Message.MessageHandler';
MessageHandler.path = '';
MessageHandler.weight = -525;

module.exports = MessageHandler;
