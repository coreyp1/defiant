"use strict";

const Handler = require('../router/handler');
const Text = require('../http/response/text');

class TextHandler extends Handler {
  constructor(context, next) {
    super(context, () => {
      context.httpResponse = new Text(context);
      context.httpResponse.data = 'This is example text.';
      next();
    });
  }
}

TextHandler.id = 'Example.TextHandler';
TextHandler.path = 'example.text';

module.exports = TextHandler;
