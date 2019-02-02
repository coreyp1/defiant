"use strict";

const Registry = require('./registry');

class InitRegistry extends Registry{
  constructor(settings, initArgs) {
    super(settings);
    this.initArgs = initArgs;
  }

  set(obj) {
    return super.set(typeof obj === "function" ? new obj(...this.initArgs) : obj);
  }
}

module.exports = InitRegistry;
