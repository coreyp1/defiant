"use strict";

const Element = require('../../formApi/element');

class WidgetPlacementRenderable extends Element {}

WidgetPlacementRenderable.Instance = require('./widgetPlacementInstance');
WidgetPlacementRenderable.templateFile = __dirname + '/../html/widgetPlacementRenderable.html';
WidgetPlacementRenderable.variables = ['availableWidgetsTitle'];

module.exports = WidgetPlacementRenderable;
