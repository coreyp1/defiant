"use strict";

const Handler = require('../../router/handler');

/**
 * Handler for loading an account based on the `context.session.accountId`.
 * @class
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.Account
 */
class AccountLoadHandler extends Handler {
  /**
   * A request has been made.  Process the request and provide the necessary
   * [Renderable]{@link Defiant.Plugin.Theme.Renderable}.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
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
