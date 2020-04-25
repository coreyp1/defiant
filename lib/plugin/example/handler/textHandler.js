"use strict";

const Handler = require('../../router/handler');
const Text = require('../../http/response/text');

/**
 * Example handler that provides a plaintext response.
 * @class
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.Example
 */
class TextHandler extends Handler {
  /**
   * A request has been made.  Add the plaintext as a response.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
    context.httpResponse = new Text(context, 'This is example text.');
  }
}

TextHandler.id = 'Example.TextHandler';
TextHandler.path = 'example.text';
// TODO: Translate
TextHandler.menu = {
  menu: 'default',
  text: 'Text Example',
  description: 'Example of outputting pure text',
};

module.exports = TextHandler;
