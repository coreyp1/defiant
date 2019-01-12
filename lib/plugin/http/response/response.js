"use strict";

class Response {
  constructor(context, data) {
    this.context = context;
    this.data = data;
  }

  async commit() {}
}

module.exports = Response;
