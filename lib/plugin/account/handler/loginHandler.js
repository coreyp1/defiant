"use strict";

const Handler = require('../../router/handler');
const Themed = require('../../http/response/themed');
const {coroutine: co} = require('bluebird');

class LoginHandler extends Handler {
  init(context) {
    let form = new (context.engine.plugin.get('Fapi').getForm('LoginForm'))({
      attributes: {
        class: 'login-form',
        id: 'account-login',
      },
    });
    return co(function*(self, superInit) {
      yield superInit.call(self, context);
      yield form.init(context);
      context.httpResponse = new Themed(context, {
        language: 'us',
        siteName: 'Defiant Login',
        head: '',
        jsFooter: '',
        content: form.commit(),
      });
    })(this, super.init);
  }
}

LoginHandler.id = 'Account.LoginHandler';
LoginHandler.path = 'login';

module.exports = LoginHandler;
