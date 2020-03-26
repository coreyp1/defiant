"use strict";

const Element = require('../../formApi/element');

/**
 * Provide a Widget placement area for use with the Layout form.
 * @class
 * @extends Defiant.Plugin.FormApi.Element
 * @memberOf Defiant.Plugin.Layout
 */
class WidgetPlacementRenderable extends Element {}

WidgetPlacementRenderable.Instance = require('./widgetPlacementInstance');
WidgetPlacementRenderable.templateFile = __dirname + '/../html/widgetPlacementRenderable.html';
WidgetPlacementRenderable.variables = ['availableWidgetsTitle'];

module.exports = WidgetPlacementRenderable;
