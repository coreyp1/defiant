"use strict";

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const FormatRegistry = require('./formatRegistry');
const Base = require('./base');
const Field = require('./field');

class QueryApi extends Plugin {
  constructor(engine) {
    super(engine);

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
        id: new Field(engine, {
          tableName: 'account',
          fieldName: 'id',
        }),
        uuid: new Field(engine, {
          tableName: 'account',
          fieldName: 'uuid',
        }),
        revision: new Field(engine, {
          tableName: 'account',
          fieldName: 'revisionId',
        }),
        created: new Field(engine, {
          tableName: 'account',
          fieldName: 'created',
        }),
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
        username: new Field(engine, {
          tableName: 'account_username',
          fieldName: 'value',
        }),
        username_weight: new Field(engine, {
          tableName: 'account_username',
          fieldName: 'weight',
        }),
      },
    }))
    .set(new Base(engine, {
      id: 'account_password',
      orm: 'account_password',
      fields: {
        password: new Field(engine, {
          tableName: 'account_password',
          fieldName: 'value',
        }),
        password_weight: new Field(engine, {
          tableName: 'account_password',
          fieldName: 'weight',
        }),
      },
    }));

    // The baseFormatRegistry defines how a rows should be displayed as a group.
    // Examples include 'inline' and 'table'.
    this.baseFormatRegistry = new FormatRegistry(this.engine)
      .set(require('./format/baseFormatSet'))
      .set(require('./format/baseFormatSetUl'))
      .set(require('./format/baseFormatSetOl'))
      .set(require('./format/baseFormatSetCsv'))
      .set(require('./format/baseFormatSetTable'));
    this.baseFormatSingleRegistry = new FormatRegistry(this.engine)
      .set(require('./format/baseFormatSingle'))
      .set(require('./format/baseFormatSingleUl'))
      .set(require('./format/baseFormatSingleOl'))
      .set(require('./format/baseFormatSingleCsv'))
      .set(require('./format/baseFormatSingleCsvRow'))
      .set(require('./format/baseFormatSingleTable'))
      .set(require('./format/baseFormatSingleTableRow'));
    this.fieldRegistry = new Registry();
    this.fieldFormatRegistry = new FormatRegistry()
      .set(require('./format/fieldFormat'))
      .set(require('./format/fieldFormatRaw'));
    this.joinRegistry = new Registry();

    // The queryRegistry contains initialized Query objects.
    this.queryRegistry = new Registry();
  }
}

module.exports = QueryApi;
