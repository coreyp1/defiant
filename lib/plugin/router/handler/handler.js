"use strict";

class Handler {
  constructor() {
    this.id = this.constructor.id || '';
    this.weight = this.constructor.weight || 0;
    this.path = this.constructor.path || '';
    this.alwaysProcess = this.constructor.alwaysProcess;
    this.menu = this.constructor.menu;
  }
  allowAccess(context) {
    return Promise.resolve(true);
  }
  init(context) {
    this.context = context;
    return Promise.resolve();
  }
}

Handler.alwaysProcess = false;

module.exports = Handler;
