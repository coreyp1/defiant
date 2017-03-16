"use strict";

const Plugin = require('../plugin');

class Account extends Plugin {
  constructor(engine) {
    super(engine);

    // Declare the Router Handlers.
    engine.plugin.get('Router').router
      .addHandler(require('./handler/loginHandler'));

    // Declare the Forms.
    engine.plugin.get('Fapi')
      .setForm(require('./form/loginForm'));

    // Declare the Entities.
    let AccountEntity = require('./entity/accountEntity');
    let account = new AccountEntity(engine, 'account');
    engine.orm.entity.set(account);
  }
}

module.exports = Account;
