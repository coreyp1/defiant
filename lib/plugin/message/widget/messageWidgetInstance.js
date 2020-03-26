"use strict";

const WidgetInstance = require('../../layout/widget/widgetInstance');

/**
 * Show the message Widget.
 * @class
 * @extends Defiant.Plugin.Layout.WidgetInstance
 * @memberOf Defiant.Plugin.Message
 */
class MessageWidgetInstance extends WidgetInstance {
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
    await super.init(data);
    this.data.content = await this.context.volatile.message.commit();
  }
}

module.exports = MessageWidgetInstance;
