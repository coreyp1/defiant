"use strict";

const WidgetInstance = require('../../layout/widget/widgetInstance');

class MessageWidgetInstance extends WidgetInstance {
  async init(data={}) {
    await super.init(data);
    this.data.content = await this.context.volatile.message.commit();
  }
}

module.exports = MessageWidgetInstance;
