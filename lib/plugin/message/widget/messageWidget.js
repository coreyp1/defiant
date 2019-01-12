"use strict";

const Widget = require('../../layout/widget');
const merge = require('../../../util/merge');

class MessageWidget extends Widget {
  async init(context, data) {
    await super.init(context, data);
    merge(this.data, {
      content: this.context.volatile.message.commit(),
    });
  }
}

MessageWidget.id = 'Message.MessageWidget';
// TODO: Translate.
MessageWidget.title = 'Message Box';
MessageWidget.description = 'This is where system messages will be shown to the user.';

module.exports = MessageWidget;
