"use strict";

const Renderable = require('../../theme/renderable');

class LayoutRenderable extends Renderable {
  constructor(engine, data={}) {
    super(engine, data);
    ['id', 'templateContents', 'variables', 'paths', 'regions'].map(v => this[v] = this.constructor[v]);
  }

  async init(context, data={}) {
    data = await super.init(context, data);
    let Layout = context.engine.pluginRegistry.get('Layout');
    let Settings = context.engine.pluginRegistry.get('Settings');
    let layoutData = await Settings.cacheRegistry.get(`layout/${this.constructor.id}.json`).load();

    // TODO: This does not belong here.  It will always execute!
    this.templateFunction = Renderable.compileTemplate(layoutData.variables, layoutData.templateContents, this.constructor.boilerplate);

    // Populate the region variables.
    data.region = {};
    for (let region in layoutData.regions) {
      data.region[region] = '';
      for (let widgetName of layoutData.regions[region]) {
        // Render the widget.
        let widget = Layout.widgetRegistry.get(widgetName);
        if (widget) {
          let widgetData = await widget.init(context, {content: data.content});
          data.region[region] += widget.commit(widgetData);
        }
      }
    }
    return data;
  }

  commit(data) {
    // TODO: Is there ever a reason to pass MORE than just data.region?
    return super.commit(data.region);
  }
}

LayoutRenderable.templateContents = `<%= content %>`;
LayoutRenderable.variables = ['content'];
LayoutRenderable.regions = {content: ['Layout.ContentWidget']};

module.exports = LayoutRenderable;
