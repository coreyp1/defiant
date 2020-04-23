"use strict";

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const FormatRegistry = require('./formatRegistry');

/**
 * QueryApi is the heart of data retrieval and display in Defiant.
 *
 * Plugins define the data that they want to make available to
 * [Queries]{@link Defiant.Plugin.QueryApi.Query} and the variety of display
 * styles that can be used to render the data for the page request.    Plugins
 * can also define relationships between different data types, which provides
 * support for relational queries.  Plugins can also supply pre-define Queries
 * which can be later customized.  An example of such a pre-defined Query would
 * be a [Page]{@link Defiant.Plugin.Page}, in which the display of the page is
 * simply a Query display.  Another example of a pre-defined query is the
 * [Account]{@link Defiant.Plugin.Account} list in the
 * [Admin]{@link Defiant.Plugin.Admin} section.
 *
 * Queries are defined by nested key/value objects that describe how the Query
 * is put together.  The query engine will then execute one or more database
 * querys to fulfill that display request.
 *
 * If a Query contains fields that are themselves made up of multiple values,
 * Then the query engine will aggregate the required ids so that the query is
 * fulfilled in as few database communications as possible.  For example,
 * suppose that a query has two columns, A and B.  B is an attriute that may
 * have multiple values, and must therefore be requested by a different
 * (sub) query than the main query which is used to fetch the rows for A.
 * Suppose that the main query returns 10 rows.  Each row, then, would need a
 * query for the attributes in B for that row.  The engine will aggregate the
 * linking fields so that only a single additional query need be executed.
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Plugin
 */
class QueryApi extends Plugin {
  /**
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @returns {Defiant.Plugin.QueryApi}
   *   The QueryApi plugin that was instantiated.
   */
  constructor(engine) {
    super(engine);

    /**
     * @member {Defiant.util.Registry} Defiant.Plugin.QueryApi#baseRegistry
     *   The possible [Base]{@link Defiant.Plugin.QueryApi.Base} tables from
     *   which a [Query]{@link Defiant.Plugin.QueryApi.Query} can be created.
     */
    this.baseRegistry = new Registry();

    /**
     * @member {Defiant.Plugin.QueryApi.FormatRegistry} Defiant.Plugin.QueryApi#baseFormatRegistry
     *   Formats that control how rows should be rendered as a group.  Examples
     *   include `inline` and `table`.
     */
    this.baseFormatRegistry = new FormatRegistry(this.engine)
      .set(require('./format/baseFormatSet'))
      .set(require('./format/baseFormatSetUl'))
      .set(require('./format/baseFormatSetOl'))
      .set(require('./format/baseFormatSetCsv'))
      .set(require('./format/baseFormatSetTable'));

    /**
     * @member {Defiant.Plugin.QueryApi.FormatRegistry} Defiant.Plugin.QueryApi#baseFormatSingleRegistry
     *   Formats that control how a single row should be rendered within the
     *   parent `baseFormatRegistry` choice.  Examples include `inline`,
     *   `table`, and `tableRow`.
     */
    this.baseFormatSingleRegistry = new FormatRegistry(this.engine)
      .set(require('./format/baseFormatSingle'))
      .set(require('./format/baseFormatSingleUl'))
      .set(require('./format/baseFormatSingleOl'))
      .set(require('./format/baseFormatSingleCsv'))
      .set(require('./format/baseFormatSingleCsvRow'))
      .set(require('./format/baseFormatSingleTable'))
      .set(require('./format/baseFormatSingleTableRow'));

    /**
     * @member {Defiant.Plugin.QueryApi.FormatRegistry} Defiant.Plugin.QueryApi#fieldFormatRegistry
     *   Formats that control how a single field should be rendered within the
     *   parent `baseFormatSingleRegistry` choice.  Examples include `text` and
     *   `raw`.
     */
    this.fieldFormatRegistry = new FormatRegistry(this.engine)
      .set(require('./format/fieldFormat'))
      .set(require('./format/fieldFormatRaw'));

    /**
     * @member {Defiant.util.Registry} Defiant.Plugin.QueryApi#queryRegistry
     *   A Registry of [Queries]{@link Defiant.Plugin.QueryApi.Query}.
     */
    this.queryRegistry = new Registry();
  }
}

module.exports = QueryApi;
