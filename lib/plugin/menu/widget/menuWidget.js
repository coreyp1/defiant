"use strict";

const Widget = require('../../layout/widget');
const Item = require('../../router/item');
const merge = require('../../../util/merge');
const {coroutine: co} = require('bluebird');

class menuWidget extends Widget {
  constructor(data={}, engine) {
    super(data);
    this.engine = engine;
    ['id', 'title', 'description', 'showParentLinks', 'maxLevels', 'overrides'].map(v => this[v] = data[v]);
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
          content += `<a href="/${entry.data.path}">${entry.data.menu.text}</a><br />`;
        }
      }
      merge(self.data, {
        content: content,
      });
    })(this, super.init);
  }

  addHandler(handler) {
    let Router = this.engine.plugin.get('Router');
    this.entries.push({
      data: handler,
      handlers: Router.router.collectHandlers(handler.path).filter(handler => handler.menu || handler.allowShowLink),
    });
    //console.log(this.id, handler);
  }
}

module.exports = menuWidget;
