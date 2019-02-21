"use strict";

const RenderableInstance = require('../../theme/renderable/renderableInstance');

class LayoutRenderableInstance extends RenderableInstance {
  async init(data={}) {
    await super.init(data);
    let Layout = this.context.engine.pluginRegistry.get('Layout');
    let Settings = this.context.engine.pluginRegistry.get('Settings');
    let layoutData = await Settings.cacheRegistry.get(`layout/${this.renderable.constructor.id}.json`).load();

    // TODO: This does not belong here.
    let Renderable = this.renderable.constructor;
    if (!Renderable.templateFunction) {
      Renderable.templateFunction = Renderable.compileTemplate(layoutData.variables, layoutData.templateContents, Renderable.boilerplate);
    }

    // Populate the region variables.
    this.data.region = {};
    for (let region in layoutData.regions) {
      this.data.region[region] = '';
      for (let widgetName of layoutData.regions[region]) {
        // Render the widget.
        let Widget = Layout.widgetRegistry.get(widgetName);
        if (Widget) {
          let widgetInstance = Widget.newInstance(this.context);
          await widgetInstance.init({content: this.data.content});
          // Note: ESlint complains when using await in a += statement.
          let contents = await widgetInstance.commit();
          this.data.region[region] += contents;
        }
      }
    }
  }

  async commit() {
    return this.renderable.templateFunction(this.data.region);
  }
}

module.exports = LayoutRenderableInstance;
