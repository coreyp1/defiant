"use strict";

const Response = require('./response');

/**
 * Class for performing a http redirect.
 * @class
 * @extends Defiant.Plugin.Http.Response
 * @memberOf Defiant.Plugin.Http.Response
 */
class Redirect extends Response {
  /**
   * @constructor
   * @param {Defiant.Context} context The request context.
   * @param {number} code The http redirect number (e.g., 303).
   * @param {String} uri The target of the redirection.
   * @returns {Defiant.Plugin.Http.Response.Redirect} The instantiated Redirect.
   */
  constructor(context, code, uri) {
    super(context, uri);
    /**
     * @member {number} Defiant.Plugin.Http.Response.Redirect#code The http
     *   redirect number (e.g., 303).
     */
    this.code = code;
  }

  /**
   * Create the redirect header.
   * @function
   * @async
   */
  async commit() {
    this.context.response.writeHead(this.code, {Location: this.data});
    this.context.response.end();
  }
}

module.exports = Redirect;
