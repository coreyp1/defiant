"use strict"

const Query = require('../../queryApi/query');
const merge = require('../../../util/merge');

class AccountQuery extends Query {
  constructor(engine, data={}) {
    super(engine, merge({
      id: 'Account',
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
          foo: { // Keyed by nameAlias.
            name: 'id',
            nameAlias: 'foo',
            baseAlias: 'acc', // Alias for the base.
            label: 'Id',
            required: true,
            format: {},
            weight: 0,
          },
          uuid: {
            name: 'uuid',
            nameAlias: 'uuid',
            baseAlias: 'acc',
            label: 'UUID',
            required: true,
            weight: 1,
          },
          revision: {
            name: 'revision',
            nameAlias: 'r',
            baseAlias: 'acc',
            label: 'Revision',
            required: true,
            weight: 1,
          },
          account_username: {
            type: 'subquery',
            name: 'account_username',
            nameAlias: 'account_username',
            label: 'Username',
            format: {
              set: {
                type: 'table',
              },
              single: {
                type: 'tableRow',
              },
            },
            statement: {
              fields: {
                username: {
                  name: 'username',
                  nameAlias: 'username',
                  baseAlias: 'account_username',
                  label: 'Username',
                  required: false,
                  weight: 2,
                },
                username_weight: {
                  name: 'username_weight',
                  nameAlias: 'username_weight',
                  baseAlias: 'account_username',
                  label: 'Username Weight',
                  required: false,
                  weight: 2,
                },
              },
              where: {},
              order: {},
              bases: {
                account_username: {
                  baseAlias: 'account_username',
                  base: 'account_username',
                  fromBaseAlias: '',
                  fromMultiple: 'acc',
                },
              },
            },
          },
  /*        password: {
            name: 'password',
            nameAlias: 'password',
            baseAlias: 'account_password',
            label: 'Password',
            multiple: false,
            required: false,
            weight: 3,
          },
  */
        },
        where: {
          combine: 'and',
          arguments: [{
            nameAlias: 'uuid',
            data: {
              test: '=',
              argument: 'from URL',
              option: '2',
            },
          /*}, {
            nameAlias: 'uuid',
            data: {
              test: '!=',
              argument: 'null',
            },
          }, {
            combine: 'or',
            arguments: [{
              nameAlias: 'uuid',
              data: {
                test: '=',
                argument: 'explicit',
                option: 'X',
              },
            }, {
              nameAlias: 'uuid',
              data: {
                test: '=',
                argument: 'null',
              },
            }],*/
          }],
        },
        order: {
          foo: {
            nameAlias: 'foo',
            expression: 'asc',
          }
        },
        bases: {
          acc: {
            baseAlias: 'acc', // Alias
            base: 'account', // Base id
            fromBaseAlias: undefined, // Base alias to join against
          },
          account_password: {
            baseAlias: 'account_password',
            base: 'account_password',
            fromBaseAlias: 'acc',
          },
        }
      },
    }, data));
  }
}

module.exports = AccountQuery;