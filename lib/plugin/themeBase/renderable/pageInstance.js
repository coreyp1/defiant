"use strict";

const RenderableInstance = require('../../theme/renderable/renderableInstance');

/**
 * The Page instance class.
 *
 * Currently using Materialize.
 * @class
 * @extends Defiant.Plugin.Theme.RenderableInstance
 * @memberOf Defiant.Plugin.ThemeBase
 */
class PageInstance extends RenderableInstance {
  /**
   * Perform any initialization needed, and in particular, async operations.
   *
   * When this function is finished, then the renderable should be ready to
   * be turned into a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
  async init(data={}) {
    // Add the default CSS & Javascript Files.
    this.context.engine.library.require(this.context, 'Materialize');

    // Add any library JavaScript & CSS.
    this.context.engine.library.process(this.context);

    await super.init(data);
  }
}

module.exports = PageInstance;
