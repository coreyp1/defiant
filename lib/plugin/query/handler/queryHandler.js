"use strict";

const Handler = require('../../router/handler');
const Themed = require('../../http/response/themed');
const {coroutine: co} = require('bluebird');

class QueryHandler extends Handler {
  init(context) {
    return co(function*() {
      const Query = context.engine.plugin.get('Query');
      let instance = Query.instanceRegistry.get('Account');
      let rows = yield instance.init(context);
      context.httpResponse = new Themed(context, {
        content: instance.commit(rows),
      });
    })();
  }
}

QueryHandler.id = 'QueryHandler';
QueryHandler.path = 'account';

module.exports = QueryHandler;
