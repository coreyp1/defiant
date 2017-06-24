"use strict";

const Handler = require('../../router/handler');
const Themed = require('../../http/response/themed');
const {coroutine: co} = require('bluebird');

class QueryHandler extends Handler {
  init(context) {
    return co(function*() {
      const QueryApi = context.engine.pluginRegistry.get('QueryApi');
      let query = QueryApi.queryRegistry.get('Account');
      let rows = yield query.init(context);
      context.httpResponse = new Themed(context, {
        content: query.commit(rows),
      });
    })();
  }
}

QueryHandler.id = 'QueryHandler';
QueryHandler.path = 'account';

module.exports = QueryHandler;
