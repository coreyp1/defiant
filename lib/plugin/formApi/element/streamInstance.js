"use strict";

const RenderableInstance = require('../../theme/renderable/renderableInstance');
const ElementInstance = require('./elementInstance');

/**
 * The Stream is a container meant to collect and then render output in a FIFO
 * manner, with an emphasis on string handling.  It is most helpful when
 * constructing large piecewise parts such as an HTML table.
 * @class
 * @extends Defiant.Plugin.FormApi.ElementInstance
 * @memberOf Defiant.Plugin.FormApi
 */
class StreamInstance extends ElementInstance {
  /**
   * @constructor
   * @param {Defiant.Plugin.FormApi.Element} renderable
   *   The Element that this is an instance of.
   * @param {Object} setup
   *   The configuration object.
   * @param {Defiant.Context} context
   *   The request context.
   * @returns {Defiant.Plugin.FormApi.StreamInstance}
   *   The instantiation of the StreamInstance.
   */
  constructor(renderable, setup, context) {
    super(renderable, setup, context);
    this.order = [];
  }

  /**
   * Concatenate all parts that have been put into the stream.  If the part is
   * a RenderableInstance, then call
   * [RenderableInstance.commit()]{@link Defiant.Plugin.Theme.RenderableInstance#commit}
   * and concatenate the result in the proper place.
   * @function
   * @async
   * @returns {String}
   *   The final string that should be provided to the user.
   */
  async commit() {
    let content = '';
    for (let item of this.order) {
      content += (typeof item === 'string')
        ? item
        : await item.commit();
    }
    if (this.wrap && (this.wrap instanceof RenderableInstance)) {
      await this.wrap.init({content});
      return await this.wrap.commit();
    }
    return content;
  }

  /**
   * Add a RenderableInstance to the collection's registry.
   *
   * If the RenderableInstance knows about forms, then notify it that it has
   * been added to this form.
   * @function
   * @param {String} instance
   *   A string to add into the stream.
   * @param {Defiant.Plugin.Theme.RenderableInstance} instance
   *   The renderable instance to add to the stream.
   * @returns {Defiant.Plugin.Theme.CollectionInstance}
   *   The current CollectionInstance.
   */
  addInstance(instance) {
    this.order.push(instance);

    // Even though the order is being tracked separately, we still want to
    // maintain the registry so that normal interaction with this element still
    // functions as expected.
    if (typeof instance !== 'string') {
      super.addInstance(instance);
    }
    return this;
  }
}

module.exports = StreamInstance;
