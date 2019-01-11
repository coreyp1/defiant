"use strict";

const Handler = require('../../router/handler');
const Json = require('../../http/response/json');

class JsonHandler extends Handler {
  async init(context) {
    context.httpResponse = new Json(context, {
      id: 3462,
      message: 'This is an example JSON response',
    });
  }
}

JsonHandler.id = 'Example.JsonHandler';
JsonHandler.path = 'example.json';
// TODO: Translate
JsonHandler.menu = {
  menu: 'default',
  text: 'JSON Example',
  description: 'Example of outputting JSON',
};

module.exports = JsonHandler;
