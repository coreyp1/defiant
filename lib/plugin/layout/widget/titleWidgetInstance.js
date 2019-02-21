"use strict";

const WidgetInstance = require('./widgetInstance');
const merge = require('../../../util/merge');

class TitleWidgetInstance extends WidgetInstance {
  async init(data={}) {
    return await super.init(merge(data, {
      // TODO: Translate.
      // TODO: Escape.
      content: this.context.page && this.context.page.title ? this.context.page.title : '',
    }));
  }
}

module.exports = TitleWidgetInstance;
