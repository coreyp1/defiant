"use strict";

const Handler = require('../../router/handler');
const Themed = require('../../http/response/themed');
const Redirect = require('../../http/response/redirect');
const {coroutine: co} = require('bluebird');

class ChangePasswordHandler extends Handler {
  allowAccess(context) {
    if (context.account && context.account.id) {
      return Promise.resolve(true);
    }
    context.httpResponse = 403;
    return Promise.resolve(false);
  }
  init(context) {
    // Redirect if the user is not logged in.
    if (!context.account || !context.account.id) {
      context.httpResponse = new Redirect(context, 303, '/');
      return Promise.resolve();
    }

    // Get the form from the Fapi form registry.
    let form = new (context.engine.plugin.get('Fapi').getForm('ChangePasswordForm'))({
      accountId: context.account.id,
      attributes: {
        class: 'change-password-form',
        id: 'account-change-password',
      },
    });

    return co(function*(self, superInit) {
      yield superInit.call(self, context);
      if (!context.account || !context.account.id) {
        // User is not logged in.  Redirect to the home page.
        context.httpResponse = new Redirect(context, 303, '/');
      }
      else {
        // User is logged in.  Show the change password form.
        yield form.init(context);
        context.httpResponse = new Themed(context, {
          language: 'us',
          siteName: 'Change Password',
          head: '',
          jsFooter: '',
          content: form.commit(),
        });
      }
    })(this, super.init);
  }
}

ChangePasswordHandler.id = 'Account.ChangePasswordHandler';
ChangePasswordHandler.path = 'password';
// TODO: Translate
ChangePasswordHandler.menu = {
  menu: 'default',
  text: 'Change Password',
  description: 'Change your password',
};

module.exports = ChangePasswordHandler;
