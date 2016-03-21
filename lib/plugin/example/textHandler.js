"use strict";

const Handler = require('../router/handler');
const Text = require('../http/response/text');
const {coroutine: co} = require('bluebird');

class TextHandler extends Handler {
  init(context) {
    return co(function*() {
      context.httpResponse = new Text(context);
      context.httpResponse.data = 'This is example text.';
    })();
  }
}

TextHandler.id = 'Example.TextHandler';
TextHandler.path = 'example.text';

module.exports = TextHandler;
