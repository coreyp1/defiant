"use strict";

const Response = require('./response');

class Json extends Response {
  commit() {
    this.context.response.setHeader("Content-Type", 'text/html');
    this.context.response.write(JSON.stringify(this.data));
    this.context.response.end();
  }
}

module.exports = Json;
