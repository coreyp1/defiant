"use strict";

const Handler = require('../../router/handler');
const Themed = require('../../http/response/themed');

/**
 * Generic Handler for Queries, using Themed output.
 * @class
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.QueryApi
 */
class QueryHandler extends Handler {
  /**
   * @constructor
   * @param {Object} data
   *   See the [Handler constructor]{@link Defiant.Plugin.Router.Handler} for
   *   more parameters of the `data` object.
   * @param {String} data.query
   *   The id of the [Query]{@link Defiant.Plugin.QueryApi.Query} that will be
   *   rendered.
   * @returns {Defiant.Plugin.QueryApi.QueryHandler}
   *   The instantiated QueryHandler.
   */
  constructor(data={}) {
    super(data);
    [
      /**
       * @member {String} Defiant.Plugin.QueryApi.QueryHandler#query
       *   The id of the [Query]{@link Defiant.Plugin.QueryApi.Query} that will
       *   be rendered.
       */
      'query',
    ].map(val => this[val] = data[val] ? data[val] : (this[val] ? this[val] : this.constructor[val]));
    this.data = data;
  }

  /**
   * A request has been made.  Process the request and provide the necessary
   * [Renderable]{@link Defiant.Plugin.Theme.Renderable}.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
    const QueryApi = context.engine.pluginRegistry.get('QueryApi');
    let query = QueryApi.queryRegistry.get(this.query);
    let rows = await query.init(context);
    context.httpResponse = new Themed(context, {
      content: query.commit(context, rows),
    });
  }
}

QueryHandler.id = undefined;
QueryHandler.path = undefined;
// Set the name of the Query that should be loaded.
QueryHandler.query = undefined;

module.exports = QueryHandler;
