"use strict";

const Widget = require('../../layout/widget');
const merge = require('../../../util/merge');

class MessageWidget extends Widget {
  async init(context, data={}) {
    return await super.init(context, merge(data, {
      content: context.volatile.message.commit(context.messageRegistryMap || {}),
    }));
  }
}

MessageWidget.id = 'Message.MessageWidget';
// TODO: Translate.
MessageWidget.title = 'Message Box';
MessageWidget.description = 'This is where system messages will be shown to the user.';

module.exports = MessageWidget;
