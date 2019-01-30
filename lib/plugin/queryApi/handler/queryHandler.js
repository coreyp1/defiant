"use strict";

const Handler = require('../../router/handler');
const Themed = require('../../http/response/themed');

class QueryHandler extends Handler {
  constructor(data={}) {
    super(data);
    ['query'].map(val => this[val] = data[val] ? data[val] : (this[val] ? this[val] : this.constructor[val]));
    this.data = data;
  }

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
