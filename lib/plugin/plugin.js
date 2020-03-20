'use strict';

/**
 * Base Plugin class that all subsequent Plugins should be based on.
 * @class
 * @memberOf Defiant
 */
class Plugin {
  /**
   * @constructor
   * @param {Defiant.Engine} engine The app engine.
   * @returns {Defiant.Plugin} The plugin that was instantiated.
   */
  constructor(engine) {
    /**
     * @member {Defiant.Engine} Defiant.Plugin#engine The app engine.
     */
    this.engine = engine;
    /**
     * @member {String} Defiant.Plugin#id A unique string identifier for this
     *   plugin.  It defaults to the constructor name.
     */
    this.id = this.constructor.name;
    /**
     * @member {number} Defiant.Plugin#weight
     *   The weight of the plugin as seen by the app engine's
     *   [plugin registry]{@link Defiant.Engine#pluginRegistry}.
     */
    this.weight = 0;
    return this;
  }

  /**
   * All plugins will be initialized in order of their weight by
   * {@link Defiant.Engine#init}.
   * @function
   * @async
   */
  async init() {
    // Just a stub.
  }
}

module.exports = Plugin;
