"use strict";

const Widget = require('../../layout/widget');
const merge = require('../../../util/merge');
const {coroutine: co} = require('bluebird');

class MessageWidget extends Widget {
  init(context, data) {
    return co(function*(self, superInit){
      yield superInit.call(self, context, data);
      merge(self.data, {
        content: self.context.volatile.message.commit(),
      });
    })(this, super.init);
  }
}

MessageWidget.id = 'Message.MessageWidget';
// TODO: Translate.
MessageWidget.title = 'Message Box';
MessageWidget.description = 'This is where system messages will be shown to the user.';

module.exports = MessageWidget;
