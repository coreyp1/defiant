"use strict";

const Handler = require('../../router/handler');

class AccountLoadHandler extends Handler {
  async init(context) {
    await super.init(context);

    // Load the Account if the ID exists in the Session.
    if (context.session.accountId) {
      let AccountEntity = context.engine.pluginRegistry.get('Orm').entityRegistry.get('account');
      context.account = await AccountEntity.load({id: context.session.accountId});
    }
  }
}

AccountLoadHandler.id = 'Account.AccountLoadHandler';
AccountLoadHandler.path = '';
AccountLoadHandler.weight = -545;

module.exports = AccountLoadHandler;
