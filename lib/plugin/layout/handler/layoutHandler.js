"use strict";

const Handler = require('../../router/handler');

/**
 * Set the appropriate layout for this request.
 * @class
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.Layout
 */
class LayoutHandler extends Handler {
  /**
   * A request has been made.  Process the request and provide the necessary
   * [Renderable]{@link Defiant.Plugin.Theme.Renderable}.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
    await super.init(context);
    let Layout = context.engine.pluginRegistry.get('Layout');

    /**
     * @member {Defiant.Plugin.Layout.LayoutRenderable} Defiant.Context#layout
     *   The layout to use for the current request.
     */
    context.layout = Layout.layoutRegistry.get('defaultLayout');

    /**
     * @member {Object} Defiant.Context#page
     *   Page variables for use by the
     *   [Layout]{@link Defiant.Context#layout}.
     */
    context.page = {};
  }
}

LayoutHandler.id = 'Layout.LayoutHandler';
LayoutHandler.path = '';
LayoutHandler.weight = -400;

module.exports = LayoutHandler;
