"use strict";

const Registry = require('../../../util/registry');
const RenderableInstance = require('./renderableInstance');

/**
 * The CollectionInstance is a container to hold multiple other
 * RenderableInstances in a registry.  It can also hold other
 * CollectionInstances, providing a tree structure to build complex outputs.
 * @class
 * @extends Defiant.Plugin.Theme.Renderable
 * @memberOf Defiant.Plugin.Theme
 */
class CollectionInstance extends RenderableInstance {
  /**
   * @constructor
   * @param {Defiant.Plugin.Theme.Renderable} renderable
   *   The Renderable that this is an instance of.
   * @param {Object} setup
   *   The configuration object.
   * @param {Defiant.Context} context
   *   The request context.
   * @returns {Defiant.Plugin.Theme.RenderableInstance}
   *   The instantiation of the RenderableInstance.
   */
  constructor(renderable, setup, context) {
    super(renderable, setup, context);
    /**
     * @member {Defiant.util.Registry} Defiant.Plugin.Theme.CollectionInstance#instanceRegistry
     *   Registry for holding the items in the collection.
     */
    this.instanceRegistry = new Registry({useId: 'name'});
  }

  /**
   * Perform any initialization needed, and in particular, async operations.
   *
   * The [Renderable.init()]{@link Defiant.Plugin.Theme.Renderable#init} is also
   * called for all Renderables in the collection.
   *
   * When this function is finished, then the renderable should be ready to
   * be turned into a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
  async init(data={}) {
    await super.init(data);
    for (let instance of this.instanceRegistry.getOrderedElements()) {
      await instance.init();
    }
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
    // Await multiple async commit() calls.
    return (await Promise.all(this.instanceRegistry.getOrderedElements()
      .map(async (item) => {
        return await item.commit();
      }))).join('');
  }

  /**
   * Add a RenderableInstance to the collection's registry.
   * @function
   * @param {Defiant.Plugin.Theme.RenderableInstance} instance
   *   The renderable instance to add to the collection.
   * @returns {Defiant.Plugin.Theme.CollectionInstance}
   *   The current CollectionInstance.
   */
  addInstance(instance) {
    this.instanceRegistry.set(instance);
    instance.parent = this;
    return this;
  }

  /**
   * Get all instances in the container, as well as their contained instances,
   * recursively.  For efficiency, this is done by returning a generator
   * function which can be used in loops, etc.
   * @function
   * @returns {function}
   *   Return a generator function that will yield all elements in a dept-first
   *   ordering.
   */
  getAllElementsRecursive() {
    // NOTE: Intentionally leaving this as a generator.
    let self = this;
    return function*() {
      for (let instance of self.instanceRegistry.getOrderedElements()) {
        yield instance;
        if (instance.getAllElementsRecursive) {
          yield* instance.getAllElementsRecursive();
        }
      }
    }();
  }
}

module.exports = CollectionInstance;
