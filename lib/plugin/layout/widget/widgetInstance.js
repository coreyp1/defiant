"use strict";

const RenderableInstance = require('../../theme/renderable/renderableInstance');
const merge = require('../../../util/merge');

/**
 * Create an instance of a Widget.
 * @class
 * @extends Defiant.Plugin.Theme.RenderableInstance
 * @memberOf Defiant.Plugin.Layout
 */
class WidgetInstance extends RenderableInstance {
  /**
   * @constructor
   * @param {Defiant.Plugin.Theme.Renderable} renderable
   *   The Renderable that this is an instance of.
   * @param {Object} setup
   *   The configuration object.
   * @param {Defiant.Context} context
   *   The request context.
   * @returns {Defiant.Plugin.Layout.WidgetInstance}
   *   The instantiation of the WidgetInstance.
   */
  constructor(renderable, setup={}, context) {
    super(renderable, merge({
      data: {
        attributes: {
          id: new Set(),
          class: new Set(['widget']),
        },
      },
    }, setup), context);
  }

  /**
   * Take all data that was passed in via the constructor as well as any work
   * done by the [init()]{@link Defiant.Plugin.Theme.RenderableInstance#init},
   * and compile it using the
   * [Renderable.templateFunction]{@link Defiant.Plugin.Theme.Renderable#templateFunction}.
   * @function
   * @async
   * @returns {String}
   *   The final string that should be provided to the user.
   */
  async commit() {
    return (this.data.content && this.data.content.trim()) ? super.commit() : '';
  }
}

module.exports = WidgetInstance;
