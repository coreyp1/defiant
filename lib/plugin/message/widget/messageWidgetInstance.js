"use strict";

const WidgetInstance = require('../../layout/widget/widgetInstance');

class MessageWidgetInstance extends WidgetInstance {
  async init(data={}) {
    await super.init(data);
    // TODO: Fix messaging!!!
    this.data.content = ""; //this.context.volatile.message.commit(this.context.messageRegistryMap || {});
  }
}

module.exports = MessageWidgetInstance;
