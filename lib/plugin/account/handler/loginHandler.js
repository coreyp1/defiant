"use strict";

const Handler = require('../../router/handler');
const Themed = require('../../http/response/themed');
const Redirect = require('../../http/response/redirect');
const {coroutine: co} = require('bluebird');

class LoginHandler extends Handler {
  allowAccess(context) {
    if (!context.account) {
      return Promise.resolve(true);
    }
    context.httpResponse = 403;
    return Promise.resolve(false);
  }
  init(context) {
    // Get the form from the Fapi form registry.
    let form = new (context.engine.plugin.get('Fapi').getForm('LoginForm'))({
      attributes: {
        class: 'login-form',
        id: 'account-login',
      },
    });

    return co(function*(self, superInit) {
      yield superInit.call(self, context);
      if (context.account && context.account.id) {
        // User is already logged in.  Redirect to the home page.
        context.httpResponse = new Redirect(context, 303, '/');
      }
      else {
        // User is not logged in.  Show the login form.
        yield form.init(context);
        context.httpResponse = new Themed(context, {
          language: 'us',
          siteName: 'Defiant Login',
          head: '',
          jsFooter: '',
          content: form.commit(),
        });
      }
    })(this, super.init);
  }
}

LoginHandler.id = 'Account.LoginHandler';
LoginHandler.path = 'login';
// TODO: Translate
LoginHandler.menu = {
  menu: 'default',
  text: 'Login',
  description: 'Login to this website',
};

module.exports = LoginHandler;
