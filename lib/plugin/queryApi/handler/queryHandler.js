"use strict";

const Handler = require('../../router/handler');
const Themed = require('../../http/response/themed');
const {coroutine: co} = require('bluebird');

class QueryHandler extends Handler {
  async init(context) {
    const QueryApi = context.engine.pluginRegistry.get('QueryApi');
    let query = QueryApi.queryRegistry.get('Account');
    let rows = await query.init(context);
    context.httpResponse = new Themed(context, {
      content: query.commit(rows),
    });
  }
}

QueryHandler.id = 'QueryHandler';
QueryHandler.path = 'account';

module.exports = QueryHandler;
