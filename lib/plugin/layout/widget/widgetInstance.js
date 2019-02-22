"use strict";

const RenderableInstance = require('../../theme/renderable/renderableInstance');
const merge = require('../../../util/merge');

class WidgetInstance extends RenderableInstance {
  constructor(renderable, setup={}, context) {
    super(renderable, merge({
      data: {
        attributes: {
          id: new Set(),
          class: new Set(['widget']),
        },
      },
    }, setup), context);
  }

  async commit() {
    return (this.data.content && this.data.content.trim()) ? super.commit() : '';
  }
}

module.exports = WidgetInstance;
