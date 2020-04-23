"use strict";

const merge = require('../../util/merge');
/**
 * @typedef {Map<String,Mixed>} Defiant.Plugin.QueryApi.QueryData
 * @prop {String} id
 *   A unique identifier for this query.
 * @prop {Map<String,Mixed>} format
 *   Format options for this Query
 * @prop {Map<String,Mixed>} format.set
 *   The "set" is the group of returned rows as a whole.
 * @prop {String} format.set.type
 *   The format for a group of rows.  Examples are `inline`, `ol`, `ul`, and
 *   `table`.
 * @prop {Map<String,Mixed>} format.single
 *   The "single" formatting applies to a single row as a whole.
 * @prop {Map<String,Mixed>} format.single.type
 *   The format for a single row, which will be formatted inside the set type.
 *   Examples are `inline` and `tableColumn`.
 * @prop {Map<String,Mixed>} handler
 *   A [Handler]{@link Defiant.Plugin.Router.Handler} associated with this
 *   Query.
 * @prop {Map<String,Mixed>} widget
 *   A [Widget]{@link Defiant.Plugin.Layout.Widget} associated with this Query.
 * @prop {Map<String,Mixed>} statement
 * @prop {Map<String,Mixed>} statement.fields
 *   The fields included in the Query.
 * @prop {Map<String,Mixed>} statement.where
 *   The WHERE clause for this Query.
 * @prop {Map<String,Mixed>} statement.order
 *   The ORDER BY clause for this QUERY.
 * @prop {Map<String,Mixed>} statement.bases
 *   The [Bases]{@link Defiant.Plugin.QueryApi.Base} used in this query.
 */
/**
 * The Query is a description of what data should be pulled from the database
 * and how it should be displayed.
 * @class
 * @memberOf Defiant.Plugin.QueryApi
 */
class Query {
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
    /**
     * @member {Defiant.Engine} Defiant.Plugin.QueryApi.Query#engine
     *   The app engine.
     */
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

    [
      /**
       * @member {String} Defiant.Plugin.QueryApi.Query#id
       *   The unique id of the query.
       */
      'id',
    ].map(key => this[key] = data[key] ? data[key] : this.constructor[key]);

    /**
     * @member {Map<String,Mixed>} Defiant.Plugin.QueryApi.Query#data
     *   The setup data.
     */
    this.data = data;
  }

  /**
   * The Query is being run against the requested context.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
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

  /**
   * Render the amalgamated results as a string.
   * @todo Shouldn't this be async?
   * @function
   * @param {Defiant.Context} context
   *   The request context.
   * @param {Object[]} rows
   *   The rows for this query.
   * @returns {String}
   *   The rendered output.
   */
  commit(context, rows) {
    // Recursively build the output for nested subqueries.
    return this.formatOutput(context, this.data, rows);
  }

  /**
   * Recursively render the rows into a single string.
   * @todo Shouldn't this be async?
   * @function
   * @param {Defiant.Context} context
   *   The request context.
   * @param {Object} subquery
   *   The subquery that is being rendered.
   * @param {Object[]} rows
   *   The rows being rendered.
   * @returns {String}
   *   The rendered output for the given subquery.
   */
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

  /**
   * Return a list of subqueries that must be executed (and the parent of that
   * subquery) in order to satisfy all fields in the Query.
   * @param {Object} current
   *   The current query.
   * @param {Object} parent
   *   The parent query of this subquery.
   * @returns {Object[]}
   *   The list of all queries and subqueries to be executed.
   */
  getQueryList(current, parent) {
    let list = [{current, parent}];
    for (let field of Object.values(current.statement.fields)) {
      if (field.type == 'subquery') {
        list.push(...this.getQueryList(field, current));
      }
    }
    return list;
  }

  /**
   * Compile the supplied `subQuery` into an actual database query object.
   * @function
   * @param {Defiant.Context}
   *   The request context.
   * @param {Object} subQuery
   *   The subquery data to be turned into a query.
   * @returns {Object}
   *   The database query object for the `subQuery`.
   */
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

  /**
   * Recursively generate the WHERE clause for the provided `subQuery`.
   * @function
   * @param {Defiant.Context} context
   *   The request context.
   * @param {Object} subQuery
   *   The subquery whose where clause is being generated.
   * @param {Object} where
   *   The database where clause to be added to.
   * @returns {Object}
   *   The compiled WHERE clause.
   */
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
