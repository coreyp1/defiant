"use strict";

const Registry = require('./registry');

/**
 * An InitRegistry is a Registry that has one additional behavior.  When an
 * object is added to an InitRegistry, and if the object is a function, then
 * the function is called with the InitRegistry's `initArgs`.
 * @class
 * @extends Defiant.util.Registry
 * @memberOf Defiant.util
 */
class InitRegistry extends Registry {
  /**
   * @constructor
   * @prop {Defiant.util.Registry.RegistrySettings} settings
   *   Configuration options for this InitRegistry.
   * @prop {Array} initArgs The arguments used to initialize any uninitialized
   *   object being added to the InitRegistry.
   * @returns {Defiant.util.InitRegistry} The InitRegistry object that was
   *   created.
   */
  constructor(settings, initArgs) {
    super(settings);
    this.initArgs = initArgs;
  }

  /**
   * Add the object `obj` into the Registry.
   *
   * If the object is not initialized (i.e., a {function}) then initialize it
   * with the arguments in `initArgs`.
   *
   * If another object exists with the same id, then that object will be
   * replaced by `obj`.
   * @param {Object} obj The object to insert into the Registry.
   * @returns {Defiant.util.InitRegistry} The InitRegistry object.
   */
  set(obj) {
    return super.set(typeof obj === "function" ? new obj(...this.initArgs) : obj);
  }
}

module.exports = InitRegistry;
