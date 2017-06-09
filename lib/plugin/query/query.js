"use strict";

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const Instance = require('./instance');
const Base = require('./base');

class Query extends Plugin {
  constructor(engine) {
    super(engine);

    engine.pluginRegistry.get('Router')
      .addHandler(new (require('./handler/queryHandler'))())

    function createAddField(tableName, field) {
      return function addField(tableAlias, alias) {
        const Table = engine.pluginRegistry.get('Orm').entityRegistry.get(tableName);
        let table = engine.sql.define(Table.schema()).as(tableAlias);
        return [table[field].as(alias)];
      };
    }
    function createAddOrderBy(tableName, field) {
      return function addOrderBy(tableAlias, alias, data) {
        const Table = engine.pluginRegistry.get('Orm').entityRegistry.get(tableName);
        let table = engine.sql.define(Table.schema()).as(tableAlias);
        // Note: Do not try to use table[field].aliased(alias).
        // It produces an error, and while the table name alias is needed,
        // the field alias itself is not required for the sort to work.
        switch (data.expression) {
        case "desc":
          return [table[field].desc];
        case "asc":
          return [table[field].asc];
        case "null":
          return [table[field].isNull()];
        case "notNull":
          return [table[field].isNotNull()];
        default:
          return [table[field]];
        }
      };
    }
    function createAddWhere(tableName, field) {
      return function addWhere(tableAlias, alias, data) {
        const Table = engine.pluginRegistry.get('Orm').entityRegistry.get(tableName);
        let table = engine.sql.define(Table.schema()).as(tableAlias);
        // Note: don't use field alias, for the same reason as in the OrderBy.
        return table[field].isNull();
      }
    }
    function formatOutput(field, alias, data) {
      switch(field.type) {
      case "raw":
        return data.values[alias];
      case "text":
      default:
        // TODO: Escape.
        return `<div class="value">${data.values[alias]}</div>`;
      }
    }
    function joinFunction(query, joinFrom, joinTo){
      let Query = engine.pluginRegistry.get('Query');
      let Orm = engine.pluginRegistry.get('Orm');
      let fromBase = Query.baseRegistry.get(joinFrom.base);
      let fromBaseTable = Orm.entityRegistry.get(fromBase.data.orm);
      let fromTable = engine.sql.define(fromBaseTable.schema()).as(joinFrom.baseAlias);
      let toBase = Query.baseRegistry.get(joinTo.base);
      let toBaseTable = Orm.entityRegistry.get(toBase.data.orm);
      let toTable = engine.sql.define(toBaseTable.schema()).as(joinTo.baseAlias);
      return query.leftJoin(toTable).on(fromTable.id.equals(toTable.parentId).and(toTable.revisionIdTo.isNull()));
    }

    this.baseRegistry = new Registry();
    this.baseRegistry.set(new Base(engine, {
      id: 'account',
      orm: 'account',
      fields: {
        id: {
          name: 'id',
          type: 'text',
          addFields: createAddField('account', 'id'),
          addOrderBy: createAddOrderBy('account', 'id'),
          formatOutput: formatOutput,
        },
        uuid: {
          name: 'uuid',
          type: 'text',
          addFields: createAddField('account', 'uuid'),
          addWhere: createAddWhere('account', 'uuid'),
          formatOutput: formatOutput,
        },
        revision: {
          name: 'revision',
          type: 'text',
          addFields: createAddField('account', 'revisionId'),
          formatOutput: formatOutput,
        },
        created: {
          name: 'created',
          type: 'text',
          addFields: createAddField('account', 'created'),
          formatOutput: formatOutput,
        },
      },
      join: {
        account_username: joinFunction,
        account_password: joinFunction,
      },
    }))
    .set(new Base(engine, {
      id: 'account_username',
      orm: 'account_username',
      fields: {
        username: {
          name: 'username',
          type: 'text',
          addFields: createAddField('account_username', 'value'),
          formatOutput: formatOutput,
        },
        username_weight: {
          name: 'username_weight',
          type: 'text',
          addFields: createAddField('account_username', 'weight'),
          formatOutput: formatOutput,
        },
      },
    }))
    .set(new Base(engine, {
      id: 'account_password',
      orm: 'account_password',
      fields: {
        password: {
          name: 'password',
          type: 'text',
          addFields: createAddField('account_password', 'value'),
          formatOutput: formatOutput,
        },
        password_weight: {
          name: 'password_weight',
          type: 'text',
          addFields: createAddField('account_password', 'weight'),
          formatOutput: formatOutput,
        },
      },
    }));
    this.baseFormatRegistry = new Registry();
    this.fieldRegistry = new Registry();
    this.fieldFormatRegistry = new Registry();
    this.joinRegistry = new Registry();

    this.instanceRegistry = new Registry();
    this.instanceRegistry.set(new Instance(engine, {
      id: 'Account',
      format: {
        type: 'inline',
      },
      handler: undefined,
      widget: undefined,
      fields: {
        foo: { // Keyed by nameAlias.
          name: 'id',
          nameAlias: 'foo',
          baseAlias: 'acc', // Alias for the base.
          label: 'Id',
          multiple: false,
          required: true,
          format: {},
          weight: 0,
        },
        uuid: {
          name: 'uuid',
          nameAlias: 'uuid',
          baseAlias: 'acc',
          label: 'UUID',
          multiple: false,
          required: true,
          weight: 1,
        },
        revision: {
          name: 'revision',
          nameAlias: 'r',
          baseAlias: 'acc',
          label: 'Revision',
          multiple: false,
          required: true,
          weight: 1,
        },
        username: {
          name: 'username',
          nameAlias: 'username',
          baseAlias: 'account_username',
          label: 'Username',
          multiple: false,
          required: false,
          weight: 2,
        },
        password: {
          name: 'password',
          nameAlias: 'password',
          baseAlias: 'account_password',
          label: 'Password',
          multiple: false,
          required: false,
          weight: 3,
        },
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
        }, {
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
          }],
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
        account_username: {
          baseAlias: 'account_username',
          base: 'account_username',
          fromBaseAlias: 'acc',
        },
        account_password: {
          baseAlias: 'account_password',
          base: 'account_password',
          fromBaseAlias: 'acc',
        },
      },
    }));
  }
}

module.exports = Query;