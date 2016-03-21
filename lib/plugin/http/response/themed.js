"use strict";

const Response = require('./response');

class Themed extends Response {
  constructor(context) {
    super(context);
    this.data = '';
  }

  commit() {
    this.context.response.setHeader("Content-Type", 'text/html');
    this.context.response.write(this.data);
    this.context.response.end();
  }
}

module.exports = Themed;
