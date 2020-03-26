"use strict";

/**
 * Base class for creating responses to HTTP requests.
 * @class
 * @memberOf Defiant.Plugin.Http
 */
class Response {
  /**
   * @constructor
   * @param {Defiant.Context} context The request context.
   * @param {Object} data The data to initialize the request.
   */
  constructor(context, data) {
    /**
     * @member {Defiant.Context} Defiant.Plugin.Http.Response#context
     *   The request context.
     */
    this.context = context;
    /**
     * @member {Object} Defiant.Plugin.Http.Response#data
     *   The data provided at initialization.
     */
    this.data = data;
  }

  /**
   * The `commit()` function is called to fulfill the request.  This is just a
   * stub, to be fleshed out by subclasses.
   * @function
   * @async
   */
  async commit() {}
}

module.exports = Response;
