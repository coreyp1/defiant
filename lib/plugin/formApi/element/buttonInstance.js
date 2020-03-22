"use strict";

const ElementInstance = require('./elementInstance');

/**
 * An instance of the Button form element.
 * @class
 * @extends Defiant.Plugin.FormApi.ElementInstance
 * @memberOf Defiant.Plugin.FormApi
 */
class ButtonInstance extends ElementInstance {
  /**
   * When this function is finished, then the form should be ready to
   * be rendered as a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
  async init(data={}) {
    const TagPair = this.context.theme.getRenderable('TagPair');
    let button = TagPair.newInstance(this.context, {
      name: this.name,
      data: {
        tag: 'button',
        attributes: {
          value: this.data.value,
          name: this.name,
          class: new Set(['btn']),
        },
        content: this.data.content || this.name,
      },
    });
    this.addInstance(button);
    await super.init(data);
  }
}

module.exports = ButtonInstance;
