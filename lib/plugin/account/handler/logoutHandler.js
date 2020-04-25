"use strict";

const Handler = require('../../router/handler');
const Redirect = require('../../http/response/redirect');

/**
 * Handler for logging out a user.
 * @class
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.Account
 */
class LogoutHandler extends Handler {
  /**
   * Determine whether or not this handler will allow access to the url in
   * [context.request]{@link Defiant.Context#request}.  May also set
   * [context.httpResponse]{@link Defiant.Context#httpResponse}.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   **/
  allowAccess(context) {
    if (context.account && context.account.id) {
      return Promise.resolve(true);
    }
    context.httpResponse = 403;
    return Promise.resolve(false);
  }

  /**
   * A request has been made.  Process the request and provide the necessary
   * [Renderable]{@link Defiant.Plugin.Theme.Renderable}.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
    await super.init(context);

    // Clean out the session information.
    let Session = context.engine.pluginRegistry.get('Session');
    await Session.deleteSessionFile(context.session.id);
    delete Session.sessions[context.session.id];
    context.request.sessionId = {};
    delete context.session;
    delete context.account;

    // Redirect to the front page.
    context.httpResponse = new Redirect(context, 303, '/');
  }
}

LogoutHandler.id = 'Account.LogoutHandler';
LogoutHandler.path = 'logout';
// TODO: Translate
LogoutHandler.menu = {
  menu: 'default',
  text: 'Logout',
  description: 'Logout of this website',
};

module.exports = LogoutHandler;
