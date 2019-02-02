"use strict";

const Widget = require('../../layout/widget');
const merge = require('../../../util/merge');

class MenuWidget extends Widget {
  constructor(engine, data={}) {
    super(engine, data);
    ['id', 'title', 'description', 'showParentLinks', 'maxLevels', 'overrides', 'displayTitle', 'attributes'].map(v => this[v] = data[v]);
    this.entries = [];
  }

  async init(context, data={}) {
    let content = '';
    for (let entry of this.entries) {
      let show = false;
      for (let handler of entry.handlers) {
        if (await handler.showLink(entry.data.path, context)) {
          show = true;
          break;
        }
      }
      if (show) {
        content += `<li><a href="/${entry.data.path}">${entry.data.menu.text}</a></li>`;
      }
    }
    let title = this.displayTitle ? `<div class="title">${this.title}</div>` : '';
    return await super.init(context, merge(data, {
      // TODO: Translate.
      // TODO: Escape.
      content: content ? `${title}<ul>${content}</ul>` : '',
      attributes: this.attributes || {},
    }));
  }

  addHandler(handler) {
    let Router = this.engine.pluginRegistry.get('Router');
    this.entries.push({
      data: handler,
      handlers: Router.router.collectHandlers(handler.path).filter(handler => handler.menu || handler.allowShowLink),
    });
  }
}

MenuWidget.templateFile = __dirname + '/../html/menuWidget.html';
module.exports = MenuWidget;
