"use strict";

const Handler = require('./handler');
const Themed = require('../../http/response/themed');

/**
 * Provides the Not Found response if another handler has set the
 * [httpResponse]{@link Defaint.Context#httpResponse} is 404.
 * @class
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.Router
 */
class NotFoundHandler extends Handler {
  /**
   * @function
   * @async
   * @return {boolean}
   *   Return `true` if [httpResponse]{@link Defaint.Context#httpResponse} is
   *   404.
   */
  async allowAccess(context) {
    // Grant access if the httpResponse is 404.
    // Grant access if there is no httpResponse (catch-all).
    return context.httpResponse === 404 || context.httpResponse === undefined;
  }

  /**
   * Prepare a themed HTTP 404 Not Found page.
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
      content: '<h1>404</h1><p>Not Found</p>',
    }, 404);
  }
}

NotFoundHandler.id = 'Router.NotFoundHandler';
NotFoundHandler.path = '';
NotFoundHandler.weight = 10000;
NotFoundHandler.alwaysProcess = true;

module.exports = NotFoundHandler;
