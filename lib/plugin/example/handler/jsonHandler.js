"use strict";

const Handler = require('../../router/handler');
const Json = require('../../http/response/json');

/**
 * Example handler that provides a JSON file.
 * @class
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.Example
 */
class JsonHandler extends Handler {
  /**
   * A request has been made.  Return a JSON output.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
    context.httpResponse = new Json(context, {
      id: 3462,
      message: 'This is an example JSON response',
    });
  }
}

JsonHandler.id = 'Example.JsonHandler';
JsonHandler.path = 'example.json';
// TODO: Translate
JsonHandler.menu = {
  menu: 'default',
  text: 'JSON Example',
  description: 'Example of outputting JSON',
};

module.exports = JsonHandler;
