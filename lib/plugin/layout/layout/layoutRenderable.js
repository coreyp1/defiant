"use strict";

const Renderable = require('../../theme/renderable');
const {coroutine: co} = require('bluebird');

class LayoutRenderable extends Renderable {
  constructor(data={}) {
    super(data);
    ['id', 'templateContents', 'variables', 'paths', 'regions'].map(v => this[v] = this.constructor[v]);
  }

  init(context, data) {
    return co(function*(self, superInit){
      yield superInit.call(self, context, data);
      let Layout = context.engine.pluginRegistry.get('Layout');
      let Settings = context.engine.pluginRegistry.get('Settings');
      let layoutData = yield Settings.cache.get(`layout/${self.constructor.id}.json`).load();

      // TODO: This does not belong here.  It will always execute!
      self.templateFunction = Renderable.compileTemplate(layoutData.variables, layoutData.templateContents, self.constructor.boilerplate);

      // Populate the region variables.
      let content = self.data.content;
      for (let region in layoutData.regions) {
        self.data[region] = '';
        for (let widgetName of layoutData.regions[region]) {
          // Render the widget.
          let widget = Layout.widgets.get(widgetName);
          if (widget) {
            yield widget.init(context, {content: content});
            self.data[region] += widget.commit();
          }
        }
      }
    })(this, super.init);
  }
}

LayoutRenderable.templateContents = `<%= content %>`;
LayoutRenderable.variables = ['content'];
LayoutRenderable.regions = {content: ['Layout.ContentWidget']};

module.exports = LayoutRenderable;
