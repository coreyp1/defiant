"use strict";

const bcrypt = require('bcrypt');
const Plugin = require('../plugin');
const VirtualHandler = require('../router/handler/virtualHandler');
const {coroutine: co} = require('bluebird');

class Account extends Plugin {
  constructor(engine) {
    super(engine);

    const Fapi = engine.plugin.get('Fapi');

    // Declare the Forms.
    Fapi
      .setForm(require('./form/loginForm'))
      .setForm(require('./form/changePasswordForm'));

    // Declare the Router Handlers.
    engine.plugin.get('Router')
      .addHandler(new (require('./handler/changePasswordHandler'))())
      .addHandler(new VirtualHandler({
        id: 'Account.LoginHandler',
        path: 'login',
        // TODO: Translate
        menu: {
          menu: 'default',
          text: 'Login',
          description: 'Login to this website',
        },
        renderable: new (Fapi.getForm('LoginForm'))({
          attributes: {
            class: 'login-form',
            id: 'account-login',
          },
        }),
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
    engine.plugin.get('Orm').entity.set(account);
  }

  init() {
    return co(function*(self){
      // Check to see if Accout Id 1 exists.
      let AccountEntity = self.engine.plugin.get('Orm').entity.get('account');
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
