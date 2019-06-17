"use strict";

const RenderableInstance = require('../../theme/renderable/renderableInstance');
const Registry = require('../../../util/registry');
const merge = require('../../../util/merge');

class ContainerInstance extends RenderableInstance {
  set(id, content, type='default') {
    if (!this.context.messageRegistryMap) {
      this.context.messageRegistryMap = {};
    }
    if (typeof this.context.messageRegistryMap[type] === 'undefined') {
      this.context.messageRegistryMap[type] = new Registry();
    }
    this.context.messageRegistryMap[type].set({id, content});
    return this;
  }

  async init(data={}) {
    return super.init(merge({
      messageRegistryMap: this.context.messageRegistryMap,
    }, data));
  }

  async commit() {
    // TODO: Each message should be its own renderable.
    let contentBlock = '';
    for (let type in this.context.messageRegistryMap || {}) {
      let content = '';
      for (let message of this.context.messageRegistryMap[type].getOrderedElements()) {
        content += `<div class="message ${message.id}">${message.content}</div>`;
      }
      contentBlock += `<div class="message-block ${type}">${content}</div>`;
      // Clear the messages.
      delete this.context.messageRegistryMap[type];
    }
    merge(this.data, {
      attributes: {
        class: new Set(['messages']),
      },
      content: contentBlock,
    })
    return super.commit();
  }
}

module.exports = ContainerInstance;
