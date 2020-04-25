"use strict";

const Handler = require('../../router/handler');
const Themed = require('../../http/response/themed');

/**
 * Example handler that provides a response wrapped in the site Theme.
 * @class
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.Example
 */
class ThemedHandler extends Handler {
  /**
   * A request has been made.  Add a Themed response.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
    context.httpResponse = new Themed(context, {
      language: 'us',
      siteName: 'Defiant',
      head: '',
      jsFooter: '',
      content: 'This is themed content.',
    });
  }
}

ThemedHandler.id = 'Example.ThemedHandler';
ThemedHandler.path = 'example.themed';
// TODO: Translate
ThemedHandler.menu = {
  menu: 'default',
  text: 'Themed Example',
  description: 'Example of outputting content on a themed page',
};

module.exports = ThemedHandler;
