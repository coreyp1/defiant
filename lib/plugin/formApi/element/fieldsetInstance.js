"use strict";

const ElementInstance = require('./elementInstance');

/**
 * An instance of an HTML fieldset within a Form.  The fieldset is intended to
 * wrap one or more form elements.
 * @class
 * @extends Defiant.Plugin.FormApi.ElementInstance
 * @memberOf Defiant.Plugin.FormApi
 */
class FieldsetInstance extends ElementInstance {
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
    this.addInstance(TagPair.newInstance(this.context, {
      name: this.name,
      weight: -999,
      data: {
        tag: 'legend',
        attributes: {
          class: new Set([this.name]),
        },
        content: data.legend || this.data.legend || '',
      },
    }));
    this.wrap = TagPair.newInstance(this.context, {
      name: this.name,
      data: {
        tag: 'fieldset',
        attributes: {
          class: new Set(['form-fieldset', this.name]),
        },
      },
    });
    await super.init(data);
  }
}

module.exports = FieldsetInstance;
