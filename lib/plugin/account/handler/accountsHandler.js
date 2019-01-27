"use strict"

const AdminQueryHandler = require('../../queryApi/handler/adminQueryHandler');

class AccountsHandler extends AdminQueryHandler {}

AccountsHandler.id = 'Account.AccountsHandler';
AccountsHandler.path = 'admin/accounts';
AccountsHandler.query = 'Accounts';

module.exports = AccountsHandler;
