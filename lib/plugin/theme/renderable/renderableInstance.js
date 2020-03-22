"use strict";

const clone = require('clone');
const merge = require('../../../util/merge');


/**
 * Base class for Renderable instances.
 *
 * It is best to read the description of the
 * [Renderable]{@link Defiant.Plugin.Theme.Renderable} class to see how themes
 * are structured.
 * @class
 * @memberOf Defiant.Plugin.Theme
 */
class RenderableInstance {
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
    /**
     * @member {Defiant.Plugin.Theme.RenderableInstance} Defiant.Plugin.Theme.RenderableInstance#parent
     *   The "parent" of this Renderable, if applicable.  Mostly useful with
     *   [CollectionInstances]{@link Defiant.Plugin.Theme.CollectionInstance}.
     */
    this.parent = undefined;
    /**
     * @member {Defiant.Plugin.Theme.Renderable} Defiant.Plugin.Theme.RenderableInstance#renderable
     *   The Renderable that created this instance.
     */
    this.renderable = renderable;
    [
      /**
       * @member {String} Defiant.Plugin.Theme.RenderableInstance#id
       *   The id of the Renderable.
       */
      'id',
      /**
       * @member {String} Defiant.Plugin.Theme.RenderableInstance#name
       *   The name of this instance.  You may wish for the name to be unique
       *   within a single request.  This name is the unique identifier used by
       *   the [CollectionInstance]{@link Defiant.Plugin.Theme.CollectionInstance}.
       */
      'name',
      /**
       * @member {number} Defiant.Plugin.Theme.RenderableInstance#weight
       *   The weight of this instance (helpful when putting Renderables into a
       *   [Collection]{@link Defiant.Plugin.Theme.Collection}).
       */
      'weight'].map(key => this[key] = setup[key] ? setup[key] : this.constructor[key]);
    /**
     * @member {Object} Defiant.Plugin.Theme.RenderableInstance#data
     *   The setup data.
     */
    this.data = clone(setup.data || {});
    /**
     * @member {Defiant.Context} Defiant.Plugin.Theme.RenderableInstance#context
     *   The request context.
     */
    this.context = context;
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
    this.data = merge(this.data, data);
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
    return this.renderable.templateFunction(this.data);
  }

  /**
   * Helper function to return the RenderableInstance that is at the root of a
   * tree-like structure.  A tree-like structure is common with
   * [Collections]{@link Defiant.Plugin.Theme.Collection}.
   * @function
   * @returns {Defiant.Plugin.Theme.Renderable.RenderableInstance}
   *   If the Renderables are in a tree structure, return the root of the tree.
   */
  getTopmostParent() {
    return this.parent ? this.parent.getTopmostParent() : this;
  }
}

module.exports = RenderableInstance;
