"use strict";

const Handler = require('./handler');
const Themed = require('../../http/response/themed');

/**
 * Provides the Access Denied response if another handler has set the
 * [httpResponse]{@link Defaint.Context#httpResponse} is 403.
 * @class
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.Router.Handler
 */
class AccessDeniedHandler extends Handler {
  /**
   * @function
   * @async
   * @return {boolean} Return `true` if
   *   [httpResponse]{@link Defaint.Context#httpResponse} is 403.
   */
  async allowAccess(context) {
    // Grant access if the httpResponse is 403.
    return context.httpResponse === 403;
  }

  /**
   * Prepare a themed HTTP 403 Access Denied page.
   * @function
   * @async
   * @param {Defiant.Context} context The request context.
   */
  async init(context) {
    context.httpResponse = new Themed(context, {
      language: 'us',
      siteName: 'Defiant',
      head: '',
      jsFooter: '',
      content: '<h1>403</h1><p>Access Denied</p>',
    }, 403);
  }
}

AccessDeniedHandler.id = 'Router.AccessDeniedHandler';
AccessDeniedHandler.path = '';
AccessDeniedHandler.weight = 10000;
AccessDeniedHandler.alwaysProcess = true;

module.exports = AccessDeniedHandler;
