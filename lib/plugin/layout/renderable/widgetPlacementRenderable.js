"use strict";

const Renderable = require('../../theme/renderable');
const path = require('path');

class WidgetPlacementRenderable extends Renderable {
  init(context) {
    // Add the CSS and Javascript.
    context.engine.library.require(context, 'LayoutWidgetPlacement');

    // TODO: Translate.
    this.data.availableWidgetsTitle = "Available Widgets";
    return super.init(context);
  }
}

WidgetPlacementRenderable.templateFile = __dirname + '/../html/widgetPlacementRenderable.html';
WidgetPlacementRenderable.variables = ['availableWidgetsTitle'];

module.exports = WidgetPlacementRenderable;