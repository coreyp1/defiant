"use strict";

const Response = require('./response');

class Redirect extends Response {
  constructor(context, code, uri) {
    super(context, uri);
    this.code = code;
  }

  async commit() {
    this.context.response.writeHead(this.code, {Location: this.data});
    this.context.response.end();
  }
}

module.exports = Redirect;
