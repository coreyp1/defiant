"use strict";

const Registry = require('./util/registry');

class Engine {
  constructor() {
    this.plugin = new Registry();
    return this;
  }

  defineBootstrapDirectory() {return this;}

  listen() {return this;}

}

module.exports = Engine;
