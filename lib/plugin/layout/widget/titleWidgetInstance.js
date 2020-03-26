"use strict";

const WidgetInstance = require('./widgetInstance');
const merge = require('../../../util/merge');

/**
 * Provide the title of the page in a Widget.
 * @class
 * @extends Defiant.Plugin.Layout.WidgetInstance
 * @memberOf Defiant.Plugin.Layout
 */
class TitleWidgetInstance extends WidgetInstance {
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
    return await super.init(merge(data, {
      // TODO: Translate.
      // TODO: Escape.
      content: this.context.page && this.context.page.title ? this.context.page.title : '',
    }));
  }
}

module.exports = TitleWidgetInstance;
