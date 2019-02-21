"use strict";

const Renderable = require('../../theme/renderable');

class LayoutRenderable extends Renderable {
  constructor(engine, data={}) {
    super(engine, data);
    ['id', 'templateContents', 'variables', 'paths', 'regions'].map(v => this[v] = this.constructor[v]);
  }
}

LayoutRenderable.Instance = require('./layoutRenderableInstance');
LayoutRenderable.templateContents = `<%= content %>`;
LayoutRenderable.variables = ['content'];
LayoutRenderable.regions = {content: ['Layout.ContentWidget']};

module.exports = LayoutRenderable;
