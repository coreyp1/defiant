"use strict";

const TagPair = require('../../theme/renderable/tagPair');
const Registry = require('../../../util/registry');
const merge = require('../../../util/merge');

class Container extends TagPair {
  set(context, id, content, type = 'default') {console.log(arguments);return;
    if (!context.messageRegistryMap) {
      context.messageRegistryMap = {};
    }
    if (typeof context.messageRegistryMap[type] === 'undefined') {
      context.messageRegistryMap[type] = new Registry();
    }
    context.messageRegistryMap[type].set({id, content});
    return this;
  }

  async init(context, data={}) {
    return await super.init(context, merge({
      messageRegistryMap: context.messageRegistryMap,
    }, data));
  }

  commit(data) {
    // TODO: Each message should be its own renderable.
    let contentBlock = '';
    for (let type in data.messageRegistryMap || {}) {
      let content = '';
      for (let message of data.messageRegistryMap[type].getOrderedElements()) {
        content += `<div class="message ${message.id}">${message.content}</div>`;
      }
      contentBlock += `<div class="message-block ${type}">${content}</div>`;
      // Clear the messages.
      delete data.messageRegistryMap[type];
    }
    return super.commit(merge(data, {
      attributes: {
        class: ['messages'],
      },
      content: contentBlock,
    }));
  }
}

Container.templateFile = __dirname + '/../html/container.html';
Container.variables = [
  'attributes',
  'content',
];

module.exports = Container;
