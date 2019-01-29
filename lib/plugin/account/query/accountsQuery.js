"use strict"

const Query = require('../../queryApi/query');
const merge = require('../../../util/merge');

class AccountsQuery extends Query {
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
              type: 'text',
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
