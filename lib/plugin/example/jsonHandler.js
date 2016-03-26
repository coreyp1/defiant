"use strict";

const Handler = require('../router/handler');
const Json = require('../http/response/json');
const {coroutine: co} = require('bluebird');

class JsonHandler extends Handler {
  init(context) {
    return co(function*() {
      context.httpResponse = new Json(context, {
        id: 3462,
        message: 'This is an example JSON response',
      });
    })();
  }
}

JsonHandler.id = 'Example.JsonHandler';
JsonHandler.path = 'example.json';

module.exports = JsonHandler;
