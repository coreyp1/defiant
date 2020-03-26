"use strict";

const Renderable = require('../../theme/renderable');

/**
 * Controls the settings of a layout.
 * @class
 * @extends Defiant.Plugin.Theme.Renderable
 * @memberOf Defiant.Plugin.Layout
 */
class LayoutRenderable extends Renderable {
  constructor(engine, setup={}) {
    super(engine, setup);
    [
      /**
       * @prop {String} Defiant.Plugin.Layout.LayoutRenderable#templateContents
       *   The template for this layout.
       */
      'templateContents',
      /**
       * @prop {String[]} Defiant.Plugin.Layout.LayoutRenderable#variables
       *   The areas on the layout that can receive a Widget.
       */
      'variables',
      /**
       * @prop {String[]} Defiant.Plugin.Layout.LayoutRenderable#paths
       *   Which paths the layout should be active on.
       */
      'paths',
      /**
       * @prop {Map<String,String[]>} Defiant.Plugin.Layout.LayoutRenderable#regions
       *   A mapping of the regions and the Widgets that will be placed in that
       *   region.
       */
      'regions',
    ].map(v => this[v] = (setup[v] != undefined) ? setup[v] : this.constructor[v]);
    this.refreshTemplate = true;
  }
}

LayoutRenderable.Instance = require('./layoutRenderableInstance');
LayoutRenderable.templateContents = `<%= content %>`;
LayoutRenderable.variables = ['content'];
LayoutRenderable.regions = {content: ['Layout.ContentWidget']};

module.exports = LayoutRenderable;
