"use strict";

const Handler = require('../../router/handler');

class MessageHandler extends Handler {
  init(context) {
    context.message = new (context.theme.getRenderable('Container'))(context);
    return Promise.resolve();
  }
}

MessageHandler.id = 'Message.MessageHandler';
MessageHandler.path = '';
MessageHandler.weight = -600;

module.exports = MessageHandler;
