"use strict";

const TagPair = require('../../theme/renderable/tagPair');
const Registry = require('../../../util/registry');

class Container extends TagPair {
  constructor(context) {
    super();
    this.context = context;
    this.message = {};
  }

  set(id, content, type = 'default') {
    if (typeof this.message[type] === 'undefined') {
      this.message[type] = new Registry();
    }
    this.message[type].set({id, content});
    return this;
  };

  commit() {
    // TODO: Each message should be its own renderable.
    let contentBlock = '';
    for (let type in this.message) {
      let content = '';
      for (let message of this.message[type].getOrderedElements()) {
        content += `<div class="message ${message.id}">${message.content}</div>`;
      }
      contentBlock += `<div class="message-block ${type}">${content}</div>`;
      // Clear the messages.
      delete this.message[type];
    }
    this.data = {
      attributes: {
        id: 'messages',
      },
      content: contentBlock,
    };
    return super.commit();
  }
}

Container.templateFile = __dirname + '/../html/container.html';
Container.variables = [
  'attributes',
  'content',
];

module.exports = Container;
