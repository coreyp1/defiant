"use strict";

const WidgetInstance = require('../../layout/widget/widgetInstance');

class MenuWidgetInstance extends WidgetInstance {
  async init(data={}) {
    let content = '';
    for (let entry of this.renderable.entries) {
      let show = false;
      for (let handler of entry.handlers) {
        if (await handler.showLink(entry.data.path, this.context)) {
          show = true;
          break;
        }
      }
      if (show) {
        content += `<li><a href="/${entry.data.path}">${entry.data.menu.text}</a></li>`;
      }
    }
    let title = this.displayTitle ? `<div class="title">${this.title}</div>` : '';
    await super.init(data);
    // TODO: Translate.
    // TODO: Escape.
    this.data.content = content ? `${title}<ul>${content}</ul>` : '';
  }
}

module.exports = MenuWidgetInstance;
