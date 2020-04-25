"use strict"

const AdminQueryHandler = require('../../queryApi/handler/adminQueryHandler');

/**
 * Handler for displaying a list of accounts to an admin.
 * @class
 * @extends Defiant.Plugin.QueryApi.AdminQueryHandler
 * @memberOf Defiant.Plugin.Account
 */
class AccountsHandler extends AdminQueryHandler {}

AccountsHandler.id = 'Account.AccountsHandler';
AccountsHandler.path = 'admin/accounts';
AccountsHandler.query = 'Accounts';

AccountsHandler.menu = {
  menu: 'admin',
  text: 'Accounts',
  description: 'List of Accounts',
};

module.exports = AccountsHandler;
