"use strict";

const Response = require('./response');

/**
 * Class for sending a plain text response to a http request.
 * @class
 * @extends Defiant.Plugin.Http.Response
 * @memberOf Defiant.Plugin.Http.Response
 */
class Text extends Response {
  /**
   * Send the text in `this.data` with the plain text html header.
   * @function
   * @async
   */
  async commit() {
    this.context.response.setHeader("Content-Type", 'text/html');
    this.context.response.write(this.data);
    this.context.response.end();
  }
}

module.exports = Text;
