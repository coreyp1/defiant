"use strict";

const Widget = require('../../layout/widget');
const Item = require('../../router/item');
const merge = require('../../../util/merge');
const {coroutine: co} = require('bluebird');

class MenuWidget extends Widget {
  constructor(data={}, engine) {
    super(data);
    this.engine = engine;
    ['id', 'title', 'description', 'showParentLinks', 'maxLevels', 'overrides', 'displayTitle', 'attributes'].map(v => this[v] = data[v]);
    this.entries = [];
  }

  init(context, data) {
    return co(function*(self, superInit){
      yield superInit.call(self, context, data);
      let content = '';
      for (let entry of self.entries) {
        let show = false;
        for (let handler of entry.handlers) {
          if (yield handler.showLink(entry.data.path, context)) {
            show = true;
            break;
          }
        }
        if (show) {
          content += `<li><a href="/${entry.data.path}">${entry.data.menu.text}</a></li>`;
        }
      }
      let title = self.displayTitle ? `<div class="title">${self.title}</div>` : '';
      merge(self.data, {
        // TODO: Translate.
        // TODO: Escape.
        content: content ? `${title}<ul>${content}</ul>` : '',
        attributes: self.attributes || {},
      });
    })(this, super.init);
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
