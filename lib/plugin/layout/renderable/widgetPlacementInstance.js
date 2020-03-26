"use strict";

const ElementInstance = require('../../formApi/element/elementInstance');
const merge = require('../../../util/merge');

/**
 * Provides a location to place a widget in the Layout edit form.
 * @class
 * @extends Defiant.Plugin.FormApi.ElementInstance
 * @memberOf Defiant.Plugin.Layout
 */
class WidgetPlacementInstance extends ElementInstance {
  /**
   * When this function is finished, then the form should be ready to
   * be rendered as a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
  async init(data={}) {
    return await super.init(merge({
      // TODO: Translate.
      availableWidgetsTitle: "Available Widgets",
    }, data));
  }

  /**
   * Call the
   * [RenderableInstance.commit()]{@link Defiant.Plugin.Theme.RenderableInstance#commit}
   * for all renderable instances in this container and join them into a single
   * string.
   *
   * If a `wrap` RenderableInstance has been specified, then the string that was
   * joined together will now  become the `content` of that RenderableInstance.
   * @function
   * @async
   * @returns {String}
   *   The final string that should be provided to the user.
   */
  async commit() {
    // Add the CSS and Javascript.
    this.context.engine.library.require(this.context, 'LayoutWidgetPlacement');
    return await this.renderable.templateFunction(this.data);

    //return await super.commit();
  }
}

module.exports = WidgetPlacementInstance;
