"use strict";

const FormInstance = require('../../formApi/formInstance');

/**
 * Provide an instance of a form for deleting a specific Entity.
 * @class
 * @extends Defiant.Plugin.FormApi.FormInstance
 * @memberOf Defiant.Plugin.Orm
 */
class EntityEditFormInstance extends FormInstance {
  /**
   * In all FormInstance derivatives, super.init() should be called LAST!
   * Otherwise, the [Static]{@link Defiant.Plugin.FormApi.Static} and
   * [Encrypt]{@link Defiant.Plugin.FormApi.Encrypt} elements will not work
   * properly.
   *
   * When this function is finished, then the form should be ready to
   * be rendered as a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
  async init(data={}) {
    const FormApi = this.context.engine.pluginRegistry.get('FormApi');
    const TagPair = this.context.theme.getRenderable('TagPair');
    const Button = FormApi.getElement('Button');
    const Entity = this.renderable.Entity;

    this.addInstance(TagPair.newInstance(this.context, {
      name: 'confirmation',
      data: {
        tag: 'div',
        content: `Are you sure that you want to delete this ${Entity.id}?`,
      }
    }));

    // Add the buttons.
    this.addInstance(Button.newInstance(this.context, {
      name: 'delete',
      data: {
        value: 'delete',
        content: 'Delete',
      },
    }));

    await super.init(data);
  }

  /**
   * Perform the form submission.
   * @function
   * @async
   */
  async submit() {
    await super.submit();

    const Entity = this.renderable.Entity;

    // Delete the entity.
    await Entity.purge(this.buildState.entity.id);

    // Delete the POST values.
    delete this.context.post[this.id];
  }
}

module.exports = EntityEditFormInstance;
