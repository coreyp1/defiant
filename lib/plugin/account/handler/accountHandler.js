"use strict"

const QueryHandler = require('../../queryApi/handler/queryHandler');

/**
 * Handler for displaying a single account.
 * @class
 * @extends Defiant.Plugin.QueryApi.QueryHandler
 * @memberOf Defiant.Plugin.Account
 */
class AccountHandler extends QueryHandler {}

AccountHandler.id = 'Account.AccountHandler';
AccountHandler.path = 'account';
AccountHandler.query = 'Account';

module.exports = AccountHandler;
