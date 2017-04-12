"use strict";

const Renderable = require('../../theme/renderable');
const path = require('path');

class WidgetPlacementRenderable extends Renderable {
  init(context) {
    // Add the CSS and Javascript.
    context.css.set({
      id: 'layoutEdit',
      url: '/file/layout/css/layoutEdit.css',
      path: path.join(__dirname, '../file/css/layoutEdit.css'),
    });
    context.jsFooter.set({
      id: 'layoutEdit',
      url: '/file/layout/js/layoutEdit.js',
      path: path.join(__dirname, '../file/js/layoutEdit.js'),
    });

    // TODO: Translate.
    this.data.availableWidgetsTitle = "Available Widgets";
    return super.init(context);
  }
}

WidgetPlacementRenderable.templateFile = __dirname + '/../html/widgetPlacementRenderable.html';
WidgetPlacementRenderable.variables = ['availableWidgetsTitle'];

module.exports = WidgetPlacementRenderable;