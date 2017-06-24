"use strict";

const Registry = require('../../util/registry');
const merge = require('../../util/merge');
const {coroutine: co, promisify} = require('bluebird');

class Query {
  constructor(engine, data={}) {
    this.engine = engine;
    data = merge({
      format: {
        type: 'inline', // 'ul', 'ol', 'table'
      },
      handler: undefined,
      widget: undefined,
      fields: [],
      where: {},
      order: [],
      bases: {},
    }, data);
    ['id'].map(key => this[key] = data[key] ? data[key] : this.constructor[key]);
    this.data = data;
  }

  init(context, data) {
    return co(function*(self) {
      self.engine = context.engine;
      let query = self.getQuery(context).toQuery();
      console.log(query);

      let sql = context.engine.sql;
      let db = context.engine.database;
      let dball = promisify(db.all, {context: db});
      // Execute the query.
      return yield dball(query.text, ...query.values);
    })(this);
  }

  commit(rows) {
    let QueryApi = this.engine.pluginRegistry.get('QueryApi');
    let outRows = [];

    // Transform the raw data into something printable for each row.
    for (let row of rows) {
      let outRow = {};
      for (let field of Object.values(this.data.fields)) {
        let baseObject = this.data.bases[field.baseAlias];
        let base = QueryApi.baseRegistry.get(baseObject.base)
        if (base && base.data.fields) {
          let f = base.data.fields[field.name];
          if (f.formatOutput) {
            outRow[field.nameAlias] = f.formatOutput(f, field.nameAlias, {values: row});
          }
        }
      }
      outRows.push(outRow);
    }

    // Combine the output with the proper formatting.
    return this.formatOutput(outRows);
  }

  formatOutput(outRows) {
    let output = '';
    switch(this.data.format.type) {
    case 'inline':
    default:
      for (let outRow of outRows) {
        let row = '';
        for (let field of Object.values(this.data.fields)) {
          // TODO: Escape.
          let label = field.label ? `<div class="query_field_label">${field.label}</div>` : '';
          row += `<div class="query_field query_field_${field.name} field__${field.nameAlias}">${label}<div class="query_field_value">${outRow[field.nameAlias]}</div></div>`;
        }
        output = `<div class="query_row">${row}</div>`;
      }
    }
    // TODO: Escape.
    return `<div class="query query_${this.id}">${output}</div>`;
  }

  getQuery(context) {
    let sql = this.engine.sql;
    let Orm = this.engine.pluginRegistry.get('Orm');
    let QueryApi = this.engine.pluginRegistry.get('QueryApi');
    let baseObject = Object.values(this.data.bases).filter(val => !val.from)[0];
    let queryBase = QueryApi.baseRegistry.get(baseObject.base);
    let baseSchema = Orm.entityRegistry.get(queryBase.data.orm).schema();

    // Begin assembling the query.
    let query = sql.define(baseSchema).as(baseObject.baseAlias);

    // Add Fields.
    let fields = [];
    for (let field of Object.values(this.data.fields)) {
      let baseAlias = this.data.bases[field.baseAlias];
      let base = QueryApi.baseRegistry.get(baseAlias.base);
      if (base && base.data && base.data.fields && base.data.fields[field.name]) {
        let baseField = base.data.fields[field.name];
        if (baseField.addFields) {
          fields.push(...baseField.addFields(baseAlias.baseAlias, field.nameAlias));
        }
      }
    }
    query = query.select(fields);

    // Add Joins.
    let joinQuery = sql.define(baseSchema).as(baseObject.baseAlias);
    for (let joinObject of Object.values(this.data.bases).filter(val => val.fromBaseAlias)) {
      let fromObject = this.data.bases[joinObject.fromBaseAlias];
      let joinFrom = QueryApi.baseRegistry.get(fromObject.base);
      if (joinFrom && joinFrom.data && joinFrom.data.join && joinFrom.data.join[joinObject.base]) {
        joinQuery = joinFrom.data.join[joinObject.base](joinQuery, fromObject, joinObject);
      }
    }
    query = query.from(joinQuery);

    // Add Where.
    // Note: Ands and Ors can be nested, so use a helper function.
    let where = this.compileWhere(context, this.data.where);
    if (where) {
      query = query.where(where);
    }

    // Add Order By.
    let orderBy = [];
    for (let order of Object.values(this.data.order)) {
      let field = this.data.fields[order.nameAlias];
      let baseObject = this.data.bases[field.baseAlias];
      let base = QueryApi.baseRegistry.get(baseObject.base);
      let baseField = base.data.fields[field.name];
      if (baseField.addOrderBy) {
        orderBy.push(...baseField.addOrderBy(baseObject.baseAlias, field.nameAlias, order));
      }
    }
    if (orderBy) {
      query = query.order(...orderBy);
    }

    // Done.
    return query;
  }

  compileWhere(context, where) {
    if (where.combine) {
      let QueryApi = context.engine.pluginRegistry.get('QueryApi');
      let Orm = context.engine.pluginRegistry.get('Orm');
      let sql = context.engine.sql;
      let clause = undefined;
      for (let arg of where.arguments || []) {
        let part = undefined;
        if (arg.combine) {
          let nextClause = this.compileWhere(context, arg);
          if (nextClause) {
            clause = clause ? clause[where.combine === "or" ? "or" : "and"](nextClause) : nextClause;
          }
        }
        else {
          let field = this.data.fields[arg.nameAlias] || {baseAlias:''};
          let baseObject = this.data.bases[field.baseAlias];
          let base = QueryApi.baseRegistry.get(baseObject.base);
          let baseField = base.data.fields[field.name];
          if (baseField && baseField.addWhere) {
            let nextClause = baseField.addWhere(baseObject.baseAlias, arg.nameAlias, arg);
            if (nextClause) {
              clause = clause? clause[where.combine === "or" ? "or" : "and"](nextClause) : nextClause;
            }
          }
        }
      }
      return clause;
    }
    return undefined;
  };
}

Query.id = '';
module.exports = Query;
