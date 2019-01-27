"use strict"

const QueryHandler = require('../../queryApi/handler/queryHandler');

class AccountHandler extends QueryHandler {}

AccountHandler.id = 'AccountHandler';
AccountHandler.path = 'account';
AccountHandler.query = 'Account';

module.exports = AccountHandler;
