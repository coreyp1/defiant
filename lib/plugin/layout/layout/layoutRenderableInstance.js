"use strict";

const RenderableInstance = require('../../theme/renderable/renderableInstance');

/**
 * Wrap the current `data.content` with the desired Layout, surrounding it with
 * the necessary Widgets.
 * @class
 * @extends Defiant.Plugin.Theme.RenderableInstance
 * @memberOf Defiant.Plugin.Layout
 */
class LayoutRenderableInstance extends RenderableInstance {
  /**
   * Perform any initialization needed, and in particular, async operations.
   *
   * When this function is finished, then the renderable should be ready to
   * be rendered as a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
  async init(data={}) {
    await super.init(data);
    let Layout = this.context.engine.pluginRegistry.get('Layout');
    let Settings = this.context.engine.pluginRegistry.get('Settings');
    let layoutData = await Settings.cacheRegistry.get(`layout/${this.renderable.id}.json`).load();

    // TODO: This does not belong here.
    // If this code is removed however, you will also need to change the
    // behavior of the LayoutEditForm save, so that the layout template
    // function will be updated.
    let Renderable = this.renderable;
    if (Renderable.refreshTemplate) {
      Renderable.templateFunction = Renderable.constructor.compileTemplate(layoutData.variables, layoutData.templateContents, Renderable.boilerplate);
      Renderable.refreshTemplate = false;
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

  /**
   * Take all data that was passed in via the constructor as well as any work
   * done by the [init()]{@link Defiant.Plugin.Theme.RenderableInstance#init},
   * and compile it using the
   * [Renderable.templateFunction]{@link Defiant.Plugin.Theme.Renderable#templateFunction}.
   * @function
   * @async
   * @returns {String}
   *   The final string that should be provided to the user.
   */
  async commit() {
    return this.renderable.templateFunction(this.data.region);
  }
}

module.exports = LayoutRenderableInstance;
