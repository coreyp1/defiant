'use strict';

/**
 * Base Plugin class that all subsequent Plugins should be based on.
 *
 * Plugins may be enabled or disabled in any order.  All plugins will be
 * notified when any other plugin is enabled or disabled.
 * @class
 * @memberOf Defiant
 */
class Plugin {
  /**
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @returns {Defiant.Plugin}
   *   The plugin that was instantiated.
   */
  constructor(engine) {
    /**
     * @member {Defiant.Engine} Defiant.Plugin#engine
     *   The app engine.
     */
    this.engine = engine;
    /**
     * @member {String} Defiant.Plugin#id
     *   A unique string identifier for this plugin.  It defaults to the
     *   constructor name.
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
   * Process a notification that some `plugin` has performed some `action`.
   *
   * Most commonly, this function will serve as notification that a plugin has
   * been either enabled, disabled, or updated.
   *
   * Plugins should be able to be enabled or disabled in any order.  Plugins
   * should clean up after themselves when disabled, and they should always
   * ensure that the required resources are present before attempting to use
   * that resource.
   *
   * In general, a Plugin's lifecycle of the notify() function will follow the
   * pattern shown below:
   *
   * `pre:enable` - The Plugin should do as much setup as possible so that, in
   * the next step, other plugins can do their part to interact with the
   * new Plugin's activation.
   *
   * `enable` - If the `plugin` is another module, then assume that it has done
   * it's own necessary setup, and add your functionality.  If the `plugin` is
   * yourself, then all other plugins have already been given a chance to
   * respond to your activation, so perform any additional setup necessary as a
   * response.
   *
   * `pre:disable` - The Plugin is about to be disabled.  It should remove
   * itself from any other plugin interactions.
   *
   * `disable` - If the `plugin` is another module, then assume that it will be
   * deleted, and perform any ancillary cleanup.  For example, if the FormApi
   * plugin is being disabled, then any Router Handlers that use the FormApi
   * should also be removed.  If the `plugin` is yourself, then all other
   * plugins have already been given a chance to respond to your pending removal
   * and you are to perform any final cleanup activities.
   * @function
   * @async
   * @param {Defiant.Plugin} plugin
   *   The Plugin to which the `action` pertains.
   * @param {String} action
   *   The action being performed.  Example actions include "pre-enable",
   *   "enable", "disable", "update".
   * @param {Mixed} [data=NULL]
   *   Any supplementary information.
   */
  async notify(plugin, action, data=null) {
    // Just a stub.
  }
}

module.exports = Plugin;
