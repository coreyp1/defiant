"use strict";

const ElementInstance = require('./elementInstance');
const Renderable = require('../../theme/renderable');
const RenderableInstance = require('../../theme/renderable/renderableInstance');

/**
 * Container to hold any Renderable.
 *
 * Maintains form awareness while allowing forms to include arbitrary
 * [RenderableInstances]{@link Defiant.Plugin.Theme.RenderableInstance} defined
 * by any plugin.
 * @class
 * @extends Defiant.Plugin.FormApi.ElementInstance
 * @memberOf Defiant.Plugin.FormApi
 */
class GenericRenderableInstance extends ElementInstance {
  /**
   * @constructor
   * @param {Defiant.Plugin.FormApi.Element} renderable
   *   The Element that this is an instance of.
   * @param {Object} setup
   *   The configuration object.
   * @param {Defiant.Context} context
   *   The request context.
   * @returns {Defiant.Plugin.FormApi.GenericRenderableInstance}
   *   The instantiation of the GenericRenderableInstance.
   */
  constructor(renderable, setup, context) {
    super(renderable, setup, context);
    [
      /**
       * @member {Defaint.Plugin.Theme.Renderable} Defiant.Plugin.FormApi.GenericRenderableInstance#renderable
       *   The Renderable contained by this class.
       */
      'renderable',
      /**
       * @member {Object} Defiant.Plugin.FormApi.GenericRenderableInstance#renderableSetup
       *   The setup data to pass when creating the RenderableInstance of the
       *   contained Renderable.
       */
      'renderableSetup',
    ].map(key => this[key] = setup[key] ? setup[key] : this.constructor[key]);
  }

  /**
   * When this function is finished, then the form should be ready to
   * be rendered as a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
  async init(data={}) {
    if (this.renderable instanceof Renderable) {
      this.renderableInstance = this.renderable.newInstance(this.context, this.renderableSetup || {});
      await this.renderableInstance.init();
    }
    await super.init(data);
  }

  /**
   * Call the
   * [RenderableInstance.commit()]{@link Defiant.Plugin.Theme.RenderableInstance#commit}
   * for all renderable instances in this container and join them into a single
   * string.
   * @function
   * @async
   * @returns {String}
   *   The final string that should be provided to the user.
   */
  async commit() {
    return (this.renderableInstance instanceof RenderableInstance) ? await this.renderableInstance.commit() : '';
  }
}

module.exports = GenericRenderableInstance;
