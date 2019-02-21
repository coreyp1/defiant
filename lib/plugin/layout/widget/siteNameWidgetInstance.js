"use strict";

const WidgetInstance = require('./widgetInstance');
const merge = require('../../../util/merge');

class SiteNameWidgetInstance extends WidgetInstance {
  async init(data={}) {
    return await super.init(merge(data.data, {
      // TODO: Configurable.
      // TODO: Escape.
      content: 'Defiant',
      attributes: {
        class: new Set(['brand-logo', 'left']),
      },
    }));
  }
}

module.exports = SiteNameWidgetInstance;
