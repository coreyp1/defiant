"use strict";

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const FormatRegistry = require('./formatRegistry');
const Query = require('./query');
const Base = require('./base');

class QueryApi extends Plugin {
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
      return function addWhere(context, tableAlias, alias, data) {
        const Table = engine.pluginRegistry.get('Orm').entityRegistry.get(tableName);
        let table = engine.sql.define(Table.schema()).as(tableAlias);
        // Note: don't use field alias, for the same reason as in the OrderBy.
        switch(data.data.test) {
        case "=":
          switch(data.data.argument) {
          case "from URL":
            let index = parseInt(data.data.option);
            return context.request.urlTokenized.length < index
              ? table[field].isNull()
              : table[field].equals(context.request.urlTokenized[index - 1])
            break;
          case "null":
            return table[field].isNull();
          case "explicit":
            return table[field].equals(data.data.option);
          }
        case "!=":
          switch(data.data.argument) {
          case "from URL":
            let index = parseInt(data.data.option);
            return context.request.urlTokenized.length < index
              ? table[field].isNull()
              : table[field].notEquals(context.request.urlTokenized[index - 1])
            break;
          case "null":
            return table[field].isNotNull();
          case "explicit":
            return table[field].notEquals(data.data.option);
          }
        case "<":
          switch(data.data.argument) {
          case "from URL":
            let index = parseInt(data.data.option);
            return context.request.urlTokenized.length < index
              ? table[field].isNull()
              : table[field].lt(context.request.urlTokenized[index - 1])
            break;
          case "explicit":
            return table[field].lt(data.data.option);
          }
        case "<=":
          switch(data.data.argument) {
          case "from URL":
            let index = parseInt(data.data.option);
            return context.request.urlTokenized.length < index
              ? table[field].isNull()
              : table[field].lte(context.request.urlTokenized[index - 1])
            break;
          case "explicit":
            return table[field].lte(data.data.option);
          }
        case ">":
          switch(data.data.argument) {
          case "from URL":
            let index = parseInt(data.data.option);
            return context.request.urlTokenized.length < index
              ? table[field].isNull()
              : table[field].gt(context.request.urlTokenized[index - 1])
            break;
          case "explicit":
            return table[field].gt(data.data.option);
          }
        case ">=":
          switch(data.data.argument) {
          case "from URL":
            let index = parseInt(data.data.option);
            return context.request.urlTokenized.length < index
              ? table[field].isNull()
              : table[field].gte(context.request.urlTokenized[index - 1])
            break;
          case "explicit":
            return table[field].gte(data.data.option);
          }
        case "like":
        case "not like":
        case "in": // .in()
        case "not in": // .notIn()
          // TODO: Clauses
        }
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
    function joinFunction(query, joinFromObject, joinToObject) {
      // Get the source table's sql definition.
      let QueryApi = engine.pluginRegistry.get('QueryApi');
      let Orm = engine.pluginRegistry.get('Orm');
      let fromBase = QueryApi.baseRegistry.get(joinFromObject.base);
      let fromBaseTable = Orm.entityRegistry.get(fromBase.data.orm);
      let fromTable = engine.sql.define(fromBaseTable.schema()).as(joinFromObject.baseAlias);

      // Get the target table's sql definition.
      let toBase = QueryApi.baseRegistry.get(joinToObject.base);
      let toBaseTable = Orm.entityRegistry.get(toBase.data.orm);
      let toTable = engine.sql.define(toBaseTable.schema()).as(joinToObject.baseAlias);

      // Add to the query.
      return query
        .leftJoin(toTable)
        .on(fromTable.id.equals(toTable.parentId)
          .and(toTable.revisionIdTo.isNull()));
    }
    function modifyMultipleParent(query, fromObject, toObject) {
      // Get the source table's sql definition.
      let QueryApi = engine.pluginRegistry.get('QueryApi');
      let Orm = engine.pluginRegistry.get('Orm');
      let fromBase = QueryApi.baseRegistry.get(fromObject.base);
      let fromBaseTable = Orm.entityRegistry.get(fromBase.data.orm);
      let fromTable = engine.sql.define(fromBaseTable.schema()).as(fromObject.baseAlias);

      // Add to the query.
      return query.select(fromTable.id.as(`__id_${toObject.baseAlias}`));
    }
    function addMultipleWhere(query, fromObject, toObject, parentRows) {
      // Get the target table's sql definition.
      let QueryApi = engine.pluginRegistry.get('QueryApi');
      let Orm = engine.pluginRegistry.get('Orm');
      let toBase = QueryApi.baseRegistry.get(toObject.base);
      let toBaseTable = Orm.entityRegistry.get(toBase.data.orm);
      let toTable = engine.sql.define(toBaseTable.schema()).as(toObject.baseAlias);

      // Compile a list of parent IDs to query for.
      let ids = parentRows
        .map(val => val[`__id_${toObject.baseAlias}`])
        .filter(val => val != undefined);

      // Add to the query.
      return query
        .select(toTable.parentId.as(`__id_${toObject.baseAlias}`))
        .where(toTable.parentId.in(ids).and(toTable.revisionIdTo.isNull()));
    }
    function integrateMultiple(fieldName, fromRows, toRows, fromObject, toObject) {
      let joinName = `__id_${toObject.baseAlias}`;

      // Collect the grouped rows.
      let collection = {};
      for (let row of toRows) {
        if (!collection[row[joinName]]) {
          collection[row[joinName]] = []
        }
        collection[row[joinName]].push(row);
      }

      // Distribute the grouped rows to the proper parent.
      for (let row of fromRows) {
        row[fieldName] = collection[row[joinName]] || [];
      }
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
        account_username: {
          single: joinFunction,
          multiple: {
            modifyMultipleParent,
            addMultipleWhere,
            integrateMultiple,
          },
        },
        account_password: {
          single: joinFunction,
          multiple: {
            modifyMultipleParent,
            addMultipleWhere,
            integrateMultiple,
          },
        }
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

    // The baseFormatRegistry defines how a rows should be displayed as a group.
    // Examples include 'inline' and 'table'.
    this.baseFormatRegistry = new FormatRegistry(this.engine)
      .set(require('./format/baseFormatSet'))
      .set(require('./format/baseFormatSetUl'))
      .set(require('./format/baseFormatSetOl'))
      .set(require('./format/baseFormatSetTable'));
    this.baseFormatSingleRegistry = new FormatRegistry(this.engine)
      .set(require('./format/baseFormatSingle'))
      .set(require('./format/baseFormatSingleUl'))
      .set(require('./format/baseFormatSingleOl'))
      .set(require('./format/baseFormatSingleTable'))
      .set(require('./format/baseFormatSingleTableRow'));
    this.fieldRegistry = new Registry();
    this.fieldFormatRegistry = new Registry();
    this.joinRegistry = new Registry();

    // The queryRegistry contains initialized Query objects.
    this.queryRegistry = new Registry();
  }
}

module.exports = QueryApi;
