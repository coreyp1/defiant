"use strict";

const Widget = require('../../layout/widget');

class MenuWidget extends Widget {
  constructor(engine, data={}) {
    super(engine, data);
    ['id', 'title', 'description', 'showParentLinks', 'maxLevels', 'overrides', 'displayTitle', 'attributes'].map(v => this[v] = data[v]);
    this.entries = [];
  }

  addHandler(handler) {
    let Router = this.engine.pluginRegistry.get('Router');
    this.entries.push({
      data: handler,
      handlers: Router.router.collectHandlers(handler.path).filter(handler => handler.menu || handler.allowShowLink),
    });
  }
}

MenuWidget.Instance = require('./menuWidgetInstance');
MenuWidget.templateFile = __dirname + '/../html/menuWidget.html';
module.exports = MenuWidget;
