"use strict"

const Query = require('../../queryApi/query');
const merge = require('../../../util/merge');

/**
 * Query for displaying a list of accounts to an admin.
 * @class
 * @extends Defiant.Plugin.QueryApi.Query
 * @memberOf Defiant.Plugin.Account
 */
class AccountsQuery extends Query {
  /**
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @param {Defiant.Plugin.QueryApi.QueryData} data
   *   The setup data for this Query.
   * @returns {Defiant.Plugin.QueryApi.Query}
   *   The instantiated Query object.
   */
  constructor(engine, data={}) {
    super(engine, merge({
      id: 'Accounts',
      format: {
        set: {
          type: 'table',
        },
        single: {
          type: 'tableRow',
        },
      },
      handler: undefined,
      widget: undefined,
      statement: {
        fields: {
          id: { // Keyed by nameAlias.
            name: 'id',
            nameAlias: 'id',
            baseAlias: 'account', // Alias for the base.
            label: 'Id',
            required: true,
            format: {
              type: 'text',
            },
            weight: 0,
          },
          uuid: {
            name: 'uuid',
            nameAlias: 'uuid',
            baseAlias: 'account',
            label: 'UUID',
            required: true,
            format: {
              type: 'uuidLink',
            },
            weight: 1,
          },
          username: {
            name: 'username',
            nameAlias: 'username',
            baseAlias: 'account_username',
            label: 'Username',
            required: false,
            format: {
              type: 'text',
            },
            weight: 2,
          },
        },
        where: {},
        order: {},
        bases: {
          account: {
            baseAlias: 'account', // Alias
            base: 'account', // Base id
            fromBaseAlias: undefined, // Base alias to join against
          },
          account_username: {
            baseAlias: 'account_username',
            base: 'account_username',
            fromBaseAlias: 'account',
          },
        },
      },
    }, data));
  }
}

module.exports = AccountsQuery;
