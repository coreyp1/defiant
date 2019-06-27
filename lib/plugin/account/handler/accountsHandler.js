"use strict"

const AdminQueryHandler = require('../../queryApi/handler/adminQueryHandler');

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
