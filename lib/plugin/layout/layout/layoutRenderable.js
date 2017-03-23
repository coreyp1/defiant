"use strict";

const Renderable = require('../../theme/renderable');
const {coroutine: co} = require('bluebird');

class LayoutRenderable extends Renderable {
  init(context) {
    return co(function*(self, superInit){
      yield superInit.call(self, context);
      let Layout = context.engine.plugin.get('Layout');

      // TODO: This does not belong here.  It will always execute!
      self.templateFunction = Renderable.compileTemplate(self.constructor.variables, self.constructor.templateContents, self.constructor.boilerplate);

      // Populate the region variables.
      let content = self.data.content;
      for (let region in self.constructor.regions) {
        self.data[region] = '';
        for (let widgetName of self.constructor.regions[region]) {
          // Render the widget.
          let widget = Layout.widgets.get(widgetName);
          if (widget) {
            widget = new widget({content: content});
            yield widget.init(context);
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
