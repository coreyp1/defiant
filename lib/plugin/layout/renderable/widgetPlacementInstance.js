"use strict";

const ElementInstance = require('../../formApi/element/elementInstance');
const merge = require('../../../util/merge');

class WidgetPlacementInstance extends ElementInstance {
  async init(data={}) {
    return await super.init(merge({
      // TODO: Translate.
      availableWidgetsTitle: "Available Widgets",
    }, data));
  }

  async commit() {
    // Add the CSS and Javascript.
    this.context.engine.library.require(this.context, 'LayoutWidgetPlacement');
    return await this.renderable.templateFunction(this.data);

    //return await super.commit();
  }
}

module.exports = WidgetPlacementInstance;
