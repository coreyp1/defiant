"use strict";

const Handler = require('../../router/handler');

/**
 * Example of a handler that is executed on every page load.
 *
 * All that this handler does is to log the page request to the console.
 * @class
 * @extend Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.Example
 */
class AlwaysProcessHandler extends Handler {
  /**
   * A request has been made.  Log it to the console.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
    // Just log the url request.
    console.log(this.constructor.id, '/' + context.request.urlTokenized.join('/'));
  }
}

AlwaysProcessHandler.alwaysProcess = true;
AlwaysProcessHandler.id = 'Example.AlwaysProcessHandler';
AlwaysProcessHandler.path = '';
AlwaysProcessHandler.weight = 1000;

module.exports = AlwaysProcessHandler;
