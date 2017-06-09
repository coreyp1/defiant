"use strict";

const bcrypt = require('bcrypt');
const Plugin = require('../plugin');
const Handler = require('../router/handler/handler');
const {coroutine: co} = require('bluebird');

class Account extends Plugin {
  constructor(engine) {
    super(engine);

    const FormApi = engine.pluginRegistry.get('FormApi');

    // Declare the Forms.
    FormApi
      .setForm(require('./form/loginForm'))
      .setForm(require('./form/changePasswordForm'));

    // Declare the Router Handlers.
    engine.pluginRegistry.get('Router')
      // Change Password Handler
      .addHandler(new Handler({
        id: 'Account.ChangePasswordHandler',
        path: 'password',
        // TODO: Translate.
        menu: {
          menu: 'default',
          text: 'Change Password',
          description: 'Change your password',
        },
        renderable: FormApi.getForm('ChangePasswordForm'),
        allowAccess: function allowAccess(context) {
          if (context.account && context.account.id) {
            return Promise.resolve(true);
          }
          context.httpResponse = 403;
          return Promise.resolve(false);
        },
      }))
      // Login Handler
      .addHandler(new Handler({
        id: 'Account.LoginHandler',
        path: 'login',
        // TODO: Translate.
        menu: {
          menu: 'default',
          text: 'Login',
          description: 'Login to this website',
        },
        renderable: FormApi.getForm('LoginForm'),
        allowAccess: function allowAccess(context) {
          if (!context.account) {
            return Promise.resolve(true);
          }
          context.httpResponse = 403;
          return Promise.resolve(false);
        },
      }))
      .addHandler(new (require('./handler/logoutHandler'))())
      .addHandler(new (require('./handler/accountLoadHandler'))());

    // Declare the Entities.
    let AccountEntity = require('./entity/accountEntity');
    let account = new AccountEntity(engine, 'account');
    engine.pluginRegistry.get('Orm').entityRegistry.set(account);
  }

  init() {
    return co(function*(self){
      // Check to see if Accout Id 1 exists.
      let AccountEntity = self.engine.pluginRegistry.get('Orm').entityRegistry.get('account');
      let account = yield AccountEntity.load({id:1});
      if (!account) {
        // Create a default admin account.
        // TODO: Default the password to a UUID.
        let password = 'foo';
        account = yield AccountEntity.save({
          username: [{value: 'admin'}],
          password: [{value: yield self.hashPassword(password)}],
        });
        console.log(`Account "admin" created, password: "${password}"`);
      }
    })(this);
  }

  hashPassword(password) {
    // Returns a Promise from bcrypt.
    // Uses a default rounds cost of 14.
    return bcrypt.hash(password, 14);
  }

  comparePassword(plaintextPassword, hashedPassword) {
    // Returns a Promise from bcrypt.
    return bcrypt.compare(plaintextPassword, hashedPassword);
  }
}

module.exports = Account;
