"use strict";

const Handler = require('../../router/handler');
const Text = require('../../http/response/text');

class TextHandler extends Handler {
  async init(context) {
    context.httpResponse = new Text(context, 'This is example text.');
  }
}

TextHandler.id = 'Example.TextHandler';
TextHandler.path = 'example.text';
// TODO: Translate
TextHandler.menu = {
  menu: 'default',
  text: 'Text Example',
  description: 'Example of outputting pure text',
};

module.exports = TextHandler;
