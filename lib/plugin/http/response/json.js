"use strict";

const Response = require('./response');

/**
 * Class for sending a json string as a response to a http request.
 * @class
 * @extends Defiant.Plugin.Http.Response
 * @memberOf Defiant.Plugin.Http.Response
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
