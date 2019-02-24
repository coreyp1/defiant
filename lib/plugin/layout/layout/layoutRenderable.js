"use strict";

const Renderable = require('../../theme/renderable');

class LayoutRenderable extends Renderable {
  constructor(engine, setup={}) {
    super(engine, setup);
    ['id', 'templateContents', 'variables', 'paths', 'regions', 'Instance'].map(v => this[v] = (setup[v] != undefined) ? setup[v] : this.constructor[v]);
    this.refreshTemplate = true;
  }
}

LayoutRenderable.Instance = require('./layoutRenderableInstance');
LayoutRenderable.templateContents = `<%= content %>`;
LayoutRenderable.variables = ['content'];
LayoutRenderable.regions = {content: ['Layout.ContentWidget']};

module.exports = LayoutRenderable;
