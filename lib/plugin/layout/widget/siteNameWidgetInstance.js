"use strict";

const WidgetInstance = require('./widgetInstance');
const merge = require('../../../util/merge');

/**
 * Provide the Site Name in a Widget.
 * @class
 * @extends Defiant.Plugin.Layout.WidgetInstance
 * @memberOf Defiant.Plugin.Layout
 */
class SiteNameWidgetInstance extends WidgetInstance {
  /**
   * Perform any initialization needed, and in particular, async operations.
   *
   * When this function is finished, then the renderable should be ready to
   * be rendered as a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
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
