"use strict";

const Handler = require('../router/handler');
const Json = require('../http/response/json');

class JsonHandler extends Handler {
  constructor(context, next) {
    super(context, () => {
      context.httpResponse = new Json(context);
      context.httpResponse.data = {
        id: 3462,
        message: 'This is an example JSON response',
      };
      next();
    });
  }
}

JsonHandler.id = 'Example.JsonHandler';
JsonHandler.path = 'example.json';

module.exports = JsonHandler;
