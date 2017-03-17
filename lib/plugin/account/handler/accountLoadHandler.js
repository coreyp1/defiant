"use strict";

const Handler = require('../../router/handler');
const {coroutine: co} = require('bluebird');

class AccountLoadHandler extends Handler {
  init(context) {
    return co(function*(self, superInit) {
      yield superInit.call(self, context);

      // Load the Account if the ID exists in the Session.
      if (context.session.accountId) {
        let AccountEntity = context.engine.orm.entity.get('account')
        context.account = yield AccountEntity.load({id: context.session.accountId});
      }
    })(this, super.init);
  }
}

AccountLoadHandler.id = 'Account.AccountLoadHandler';
AccountLoadHandler.path = '';
AccountLoadHandler.weight = -545;

module.exports = AccountLoadHandler;
