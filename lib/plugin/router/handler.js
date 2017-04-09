"use strict";

class Handler {
  constructor(context) {
    this.context = context;
  }
  canAccess(context) {
    return Promise.resolve(true);
  }
  init(context) {
    this.context = context;
    return Promise.resolve();
  }
}

module.exports = Handler;
