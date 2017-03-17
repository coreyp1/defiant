"use strict";

const Plugin = require('../plugin');
const {coroutine: co} = require('bluebird');

class Account extends Plugin {
  constructor(engine) {
    super(engine);

    // Declare the Router Handlers.
    engine.plugin.get('Router').router
      .addHandler(require('./handler/loginHandler'))
      .addHandler(require('./handler/accountLoadHandler'));

    // Declare the Forms.
    engine.plugin.get('Fapi')
      .setForm(require('./form/loginForm'));

    // Declare the Entities.
    let AccountEntity = require('./entity/accountEntity');
    let account = new AccountEntity(engine, 'account');
    engine.orm.entity.set(account);
  }

  init() {
    return co(function*(self){
      // Check to see if Accout Id 1 exists.
      let AccountEntity = self.engine.orm.entity.get('account');
      let account = yield AccountEntity.load({id:1});
      if (!account) {
        // Create a default admin account.
        let password = 'foo';
        account = yield AccountEntity.save({
          username: [{value: 'admin'}],
          password: [{value: password}],
        });
        console.log(`Account 'admin' created, password: "${password}"`);
      }
    })(this);
  }
}

module.exports = Account;
