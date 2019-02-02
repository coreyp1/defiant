"use strict";

const Renderable = require('../../theme/renderable');
const merge = require('../../../util/merge');

class WidgetPlacementRenderable extends Renderable {
  async init(context, data={}) {
    // Add the CSS and Javascript.
    context.engine.library.require(context, 'LayoutWidgetPlacement');

    return await super.init(context,  merge({
      // TODO: Translate.
      availableWidgetsTitle: "Available Widgets",
    }, data));
  }
}

WidgetPlacementRenderable.templateFile = __dirname + '/../html/widgetPlacementRenderable.html';
WidgetPlacementRenderable.variables = ['availableWidgetsTitle'];

module.exports = WidgetPlacementRenderable;
