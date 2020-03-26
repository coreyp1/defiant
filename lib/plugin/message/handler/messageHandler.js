"use strict";

const Handler = require('../../router/handler');

/**
 * Add a Message container to the request context volatile session object.
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.Message
 */
class MessageHandler extends Handler {
  /**
   * A request has been made.  Process the request and provide the necessary
   * [Renderable]{@link Defiant.Plugin.Theme.Renderable}.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
    if (!context.volatile.message) {
      context.volatile.message = context.theme.getRenderable('Container').newInstance(context);
    }
  }
}

MessageHandler.id = 'Message.MessageHandler';
MessageHandler.path = '';
MessageHandler.weight = -525;

module.exports = MessageHandler;
