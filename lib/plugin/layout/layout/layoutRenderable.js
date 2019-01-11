"use strict";

const Renderable = require('../../theme/renderable');

class LayoutRenderable extends Renderable {
  constructor(data={}) {
    super(data);
    ['id', 'templateContents', 'variables', 'paths', 'regions'].map(v => this[v] = this.constructor[v]);
  }

  async init(context, data) {
    await super.init(context, data);
    let Layout = context.engine.pluginRegistry.get('Layout');
    let Settings = context.engine.pluginRegistry.get('Settings');
    let layoutData = await Settings.cacheRegistry.get(`layout/${this.constructor.id}.json`).load();

    // TODO: This does not belong here.  It will always execute!
    this.templateFunction = Renderable.compileTemplate(layoutData.variables, layoutData.templateContents, this.constructor.boilerplate);

    // Populate the region variables.
    let content = this.data.content;
    for (let region in layoutData.regions) {
      this.data[region] = '';
      for (let widgetName of layoutData.regions[region]) {
        // Render the widget.
        let widget = Layout.widgetRegistry.get(widgetName);
        if (widget) {
          await widget.init(context, {content: content});
          this.data[region] += widget.commit();
        }
      }
    }
  }
}

LayoutRenderable.templateContents = `<%= content %>`;
LayoutRenderable.variables = ['content'];
LayoutRenderable.regions = {content: ['Layout.ContentWidget']};

module.exports = LayoutRenderable;
