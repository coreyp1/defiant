"use strict";

const RenderableInstance = require('../../theme/renderable/renderableInstance');
const Registry = require('../../../util/registry');
const merge = require('../../../util/merge');

/**
 * Collect and display the messages for this current request context.
 * @class
 * @extends Defiant.Plugin.Theme.RenderableInstance
 * @memberOf Defiant.Plugin.Message
 */
class ContainerInstance extends RenderableInstance {
  /**
   * Set a message on the current request context.
   * @param {String} id
   *   An identifier for this message.
   * @param {String} content
   *   The message to be displayed.
   * @param {String} [type="default"]
   *   The grouping for this message.
   */
  set(id, content, type='default') {
    if (!this.context.messageRegistryMap) {
      /**
       * @member {Map<String,Defiant.util.Registry>} Defiant.Context#messageRegistryMap
       *   A key/value store of messages.  The key is the message type and the
       *   value is a Registry to hold the message.  The message may be a
       *   string.
       */
      this.context.messageRegistryMap = {};
    }
    if (typeof this.context.messageRegistryMap[type] === 'undefined') {
      this.context.messageRegistryMap[type] = new Registry();
    }
    this.context.messageRegistryMap[type].set({id, content});
    return this;
  }

  /**
   * Perform any initialization needed, and in particular, async operations.
   *
   * When this function is finished, then the renderable should be ready to
   * be rendered as a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
  async init(data={}) {
    return super.init(merge({
      messageRegistryMap: this.context.messageRegistryMap,
    }, data));
  }

  /**
   * Take all data that was passed in via the constructor as well as any work
   * done by the [init()]{@link Defiant.Plugin.Theme.RenderableInstance#init},
   * and compile it using the
   * [Renderable.templateFunction]{@link Defiant.Plugin.Theme.Renderable#templateFunction}.
   * @function
   * @async
   * @returns {String}
   *   The final string that should be provided to the user.
   */
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
