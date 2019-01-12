"use strict";

const Response = require('./response');

class Json extends Response {
  async commit() {
    this.context.response.setHeader("Content-Type", 'text/html');
    this.context.response.write(JSON.stringify(this.data));
    this.context.response.end();
  }
}

module.exports = Json;
