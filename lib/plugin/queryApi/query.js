"use strict";

const merge = require('../../util/merge');

class Query {
  constructor(engine, data={}) {
    this.engine = engine;
    data = merge({
      format: {
        set: {
          type: 'inline', // 'ul', 'ol', 'table'
        },
        single: {
          type: 'inline', // 'inline', 'tableColumn'
        },
      },
      handler: undefined,
      widget: undefined,
      statement: {
        fields: {},
        where: {},
        order: {},
        bases: {},
      },
    }, data);
    ['id'].map(key => this[key] = data[key] ? data[key] : this.constructor[key]);
    this.data = data;
  }

  async init(context) {
    this.engine = context.engine;
    let QueryApi = this.engine.pluginRegistry.get('QueryApi');
    let outRows = [];

    // Get a list of all of the queries and subqueries that must be executed.
    for (let querySet of this.getQueryList(this.data, {})) {
      let query = this.getSubQuery(context, querySet.current);
      let db = context.engine.database;

      // Add the subquery filter.
      let targetObject, baseObject, base;
      if (querySet.current.type == 'subquery') {
        // Find the base definition.
        targetObject = Object.values(querySet.current.statement.bases).filter(val => val.fromBaseAlias == '')[0];
        baseObject = querySet.parent.statement.bases[targetObject.fromMultiple];
        base = QueryApi.baseRegistry.get(baseObject.base);

        // Add the filters for the parent's ids.
        if (base && base.data && base.data.join && base.data.join[querySet.current.name] && base.data.join[querySet.current.name].multiple && base.data.join[querySet.current.name].multiple.addMultipleWhere) {
          base.data.join[querySet.current.name].multiple.addMultipleWhere(query, baseObject, targetObject, querySet.parent.rows);
        }
      }

      // TODO: Better error catching for returned rows.
      // Execute the query.
      query = query.toQuery();
      querySet.current.rows = await new Promise((accept) => {
        db.all(query.text, ...query.values, (err, rows) => {
          return accept(rows ? rows : err);
        });
      });
      if (!Object.keys(querySet.parent).length) {
        // The parent is empty, so this is the base set of rows.
        outRows = querySet.current.rows;
      }

      // Merge the rows into the parent dataset.
      if (querySet.current.type == 'subquery') {
        // `base` was previously set when adding the subquery filters.
        // Now, join the rows.
        if (base && base.data && base.data.join && base.data.join[querySet.current.name] && base.data.join[querySet.current.name].multiple && base.data.join[querySet.current.name].multiple.integrateMultiple) {
          base.data.join[querySet.current.name].multiple.integrateMultiple(querySet.current.nameAlias, querySet.parent.rows, querySet.current.rows, baseObject, targetObject);
        }
      }
    }
    return outRows;
  }

  commit(context, rows) {
    // Recursively build the output for nested subqueries.
    return this.formatOutput(context, this.data, rows);
  }

  formatOutput(context, subquery, rows) {
    let QueryApi = this.engine.pluginRegistry.get('QueryApi');
    let outRows = [];

    // Transform the raw data into something printable for each row.
    for (let row of rows) {
      let outRow = {};
      for (let field of Object.values(subquery.statement.fields)) {
        if (field.type == 'subquery') {
          outRow[field.nameAlias] = this.formatOutput(context, field, row[field.nameAlias]);
        }
        else {
          let baseObject = subquery.statement.bases[field.baseAlias];
          let base = QueryApi.baseRegistry.get(baseObject.base);
          if (base && base.data.fields) {
            let f = base.data.fields[field.name];
            if (f.formatOutput) {
              outRow[field.nameAlias] = f.formatOutput(context, subquery, field, {values: row});
            }
          }
        }
      }
      outRows.push(outRow);
    }
    const BaseFormatter = QueryApi.baseFormatRegistry.get(subquery.format.set.type || 'inline');
    let output = BaseFormatter.commit(context, subquery, outRows);
    // TODO: Escape.
    return subquery.id
      ? `<div class="query query_${subquery.id}">${output}</div>`
      : `<div class="subquery subquery_${subquery.nameAlias}">${output}</div>`;
  }

  getQueryList(current, parent) {
    let list = [{current, parent}];
    for (let field of Object.values(current.statement.fields)) {
      if (field.type == 'subquery') {
        list.push(...this.getQueryList(field, current));
      }
    }
    return list;
  }

  getSubQuery(context, subQuery) {
    let sql = this.engine.sql;
    let Orm = this.engine.pluginRegistry.get('Orm');
    let QueryApi = this.engine.pluginRegistry.get('QueryApi');
    let baseObject = Object.values(subQuery.statement.bases).filter(val => !val.from)[0];
    let queryBase = QueryApi.baseRegistry.get(baseObject.base);
    let baseSchema = Orm.entityRegistry.get(queryBase.data.orm).schema();

    // Begin assembling the query.
    let query = sql.define(baseSchema).as(baseObject.baseAlias);

    // Add Fields.
    let fields = [];
    for (let field of Object.values(subQuery.statement.fields).filter(val => val.type != 'subquery')) {
      let baseAlias = subQuery.statement.bases[field.baseAlias];
      let base = QueryApi.baseRegistry.get(baseAlias.base);
      if (base && base.data && base.data.fields && base.data.fields[field.name]) {
        let baseField = base.data.fields[field.name];
        if (baseField.addField) {
          fields.push(...baseField.addField(baseAlias.baseAlias, field.nameAlias));
        }
      }
    }
    query = query.select(fields);

    // Add Joins.
    let joinQuery = sql.define(baseSchema).as(baseObject.baseAlias);
    for (let joinObject of Object.values(subQuery.statement.bases).filter(val => val.fromBaseAlias)) {
      let fromObject = subQuery.statement.bases[joinObject.fromBaseAlias];
      let joinFrom = QueryApi.baseRegistry.get(fromObject.base);
      if (joinFrom && joinFrom.data && joinFrom.data.join && joinFrom.data.join[joinObject.base] && joinFrom.data.join[joinObject.base].single) {
        joinQuery = joinFrom.data.join[joinObject.base].single(joinQuery, fromObject, joinObject);
      }
    }
    query = query.from(joinQuery);

    // Add Where.
    // Note: Ands and Ors can be nested, so use a helper function.
    let where = this.compileWhere(context, subQuery, subQuery.statement.where);
    if (where) {
      query = query.where(where);
    }

    // Add Order By.
    let orderBy = [];
    for (let order of Object.values(subQuery.statement.order)) {
      let field = subQuery.statement.fields[order.nameAlias];
      let baseObject = subQuery.statement.bases[field.baseAlias];
      let base = QueryApi.baseRegistry.get(baseObject.base);
      let baseField = base.data.fields[field.name];
      if (baseField.addOrderBy) {
        orderBy.push(...baseField.addOrderBy(baseObject.baseAlias, field.nameAlias, order));
      }
    }
    if (orderBy) {
      query = query.order(...orderBy);
    }

    // Add subquery fields.
    for (let multipleQuery of Object.values(subQuery.statement.fields).filter(val => val.type == 'subquery')) {
      // Find the base name.
      let targetObject = Object.values(multipleQuery.statement.bases).filter(val => val.fromBaseAlias == '')[0];
      let baseObject = subQuery.statement.bases[targetObject.fromMultiple];
      let base = QueryApi.baseRegistry.get(baseObject.base);
      if (base && base.data && base.data.join && base.data.join[multipleQuery.name] && base.data.join[multipleQuery.name].multiple && base.data.join[multipleQuery.name].multiple.modifyMultipleParent) {
        query = base.data.join[multipleQuery.name].multiple.modifyMultipleParent(query, baseObject, targetObject)
      }
    }

    // Done.
    return query;
  }

  compileWhere(context, subQuery, where) {
    if (where.combine) {
      let QueryApi = context.engine.pluginRegistry.get('QueryApi');
      let clause = undefined;
      for (let arg of where.arguments || []) {
        if (arg.combine) {
          let nextClause = this.compileWhere(context, subQuery, arg);
          if (nextClause) {
            clause = clause ? clause[where.combine === "or" ? "or" : "and"](nextClause) : nextClause;
          }
        }
        else {
          let field = subQuery.statement.fields[arg.nameAlias] || {baseAlias:''};
          let baseObject = subQuery.statement.bases[field.baseAlias];
          let base = QueryApi.baseRegistry.get(baseObject.base);
          let baseField = base.data.fields[field.name];
          if (baseField && baseField.addWhere) {
            let nextClause = baseField.addWhere(context, baseObject.baseAlias, arg.nameAlias, arg);
            if (nextClause) {
              clause = clause ? clause[where.combine === "or" ? "or" : "and"](nextClause) : nextClause;
            }
          }
        }
      }
      return clause;
    }
    return undefined;
  }
}

Query.id = '';
module.exports = Query;
