"use strict";

const Handler = require('../router/handler');
const Themed = require('../http/response/themed');
const {coroutine: co} = require('bluebird');

class ThemedHandler extends Handler {
  init(context) {
    return co(function*() {
      context.httpResponse = new Themed(context);
      context.httpResponse.data = 'This is example text.';
    })();
  }
}

ThemedHandler.id = 'Example.ThemedHandler';
ThemedHandler.path = 'example.themed';

module.exports = ThemedHandler;
