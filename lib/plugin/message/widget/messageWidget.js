"use strict";

const Widget = require('../../layout/widget');
const {coroutine: co} = require('bluebird');

class MessageWidget extends Widget {
  init(context) {
    return co(function*(self, superInit){
      yield superInit.call(self, context);
      self.data = {
        content: self.context.volatile.message.commit(),
      };
    })(this, super.init);
  }
}

MessageWidget.id = 'Message.MessageWidget';

module.exports = MessageWidget;
