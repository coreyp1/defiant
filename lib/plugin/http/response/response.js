"use strict";

class Response {
  constructor(context, data) {
    this.context = context;
    this.data = data;
  }

  commit() {}
}

module.exports = Response;
