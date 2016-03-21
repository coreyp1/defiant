"use strict";

const Response = require('./response');

class Json extends Response {
  constructor(context) {
    super(context);
    this.data = undefined;
  }

  commit() {
    this.context.response.setHeader("Content-Type", 'text/html');
    this.context.response.write(JSON.stringify(this.data));
    this.context.response.end();
  }
}

module.exports = Json;
