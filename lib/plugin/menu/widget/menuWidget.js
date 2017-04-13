"use strict";

const Widget = require('../../layout/widget');
const Item = require('../../router/item');
const merge = require('../../../util/merge');
const {coroutine: co} = require('bluebird');

class menuWidget extends Widget {
  constructor(data={}) {
    super(data);
    ['id', 'title', 'description', 'showParentLinks', 'maxLevels', 'overrides'].map(v => this[v] = data[v]);
    this.entries = [];
  }

  init(context, data) {
    return co(function*(self, superInit){
      yield superInit.call(self, context, data);
      let content = '';
      for (let entry of self.entries) {
        content += `<a href="/${entry.handler.path}">${entry.handler.menu.text}</a><br />`;
      }
      merge(self.data, {
        content: content,
      });
    })(this, super.init);
  }

  addHandler(handler) {
    this.entries.push({   
      handler: handler,
    });
    //console.log(this.id, handler);
  }
}

module.exports = menuWidget;
