"use strict";

const Handler = require('../../router/handler');
const Themed = require('../../http/response/themed');
const {coroutine: co} = require('bluebird');
const Redirect = require('../../http/response/redirect');

class LogoutHandler extends Handler {
  allowAccess(context) {
    if (context.account && context.account.id) {
      return Promise.resolve(true);
    }
    context.httpResponse = 403;
    return Promise.resolve(false);
  }
  init(context) {
    return co(function*(self, superInit) {
      yield superInit.call(self, context);

      // Clean out the session information.
      let Session = context.engine.pluginRegistry.get('Session');
      yield Session.deleteSessionFile(context.session.id);
      delete Session.sessions[context.session.id];
      context.request.sessionId = {};
      delete context.session;
      delete context.account;

      // Redirect to the front page.
      context.httpResponse = new Redirect(context, 303, '/');
    })(this, super.init);
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
