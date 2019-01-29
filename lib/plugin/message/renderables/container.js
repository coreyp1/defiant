"use strict";

const TagPair = require('../../theme/renderable/tagPair');
const Registry = require('../../../util/registry');
const merge = require('../../../util/merge');

class Container extends TagPair {
  constructor(context) {
    super();
    this.context = context;
    this.messageRegistryMap = {};
  }

  set(id, content, type = 'default') {
    if (typeof this.messageRegistryMap[type] === 'undefined') {
      this.messageRegistryMap[type] = new Registry();
    }
    this.messageRegistryMap[type].set({id, content});
    return this;
  }

  commit() {
    // TODO: Each message should be its own renderable.
    let contentBlock = '';
    for (let type in this.messageRegistryMap) {
      let content = '';
      for (let message of this.messageRegistryMap[type].getOrderedElements()) {
        content += `<div class="message ${message.id}">${message.content}</div>`;
      }
      contentBlock += `<div class="message-block ${type}">${content}</div>`;
      // Clear the messages.
      delete this.messageRegistryMap[type];
    }
    merge(this.data, {
      attributes: {
        class: ['messages'],
      },
      content: contentBlock,
    });
    return super.commit();
  }
}

Container.templateFile = __dirname + '/../html/container.html';
Container.variables = [
  'attributes',
  'content',
];

module.exports = Container;
