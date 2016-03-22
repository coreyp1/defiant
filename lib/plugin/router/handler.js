"use strict";

class Handler {
  constructor(context) {
    this.context = context;
  }
  init(context) {
    this.context = context;
    return Promise.resolve();
  }
}

module.exports = Handler;
