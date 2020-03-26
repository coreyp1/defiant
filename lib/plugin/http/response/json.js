"use strict";

const Response = require('./response');

/**
 * Class for sending a JSON string as a response to a HTTP request.
 * @class
 * @extends Defiant.Plugin.Http.Response
 * @memberOf Defiant.Plugin.Http
 */
class Json extends Response {
  /**
   * Pass the `this.data` through `JSON.stringify()` and return the result.
   * @function
   * @async
   **/
  async commit() {
    this.context.response.setHeader("Content-Type", 'text/html');
    this.context.response.write(JSON.stringify(this.data));
    this.context.response.end();
  }
}

module.exports = Json;
