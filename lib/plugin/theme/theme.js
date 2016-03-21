"use strict";

const Plugin = require('../plugin');

class Theme extends Plugin {
  constructor(engine) {
    super('theme', engine);
    this.renderable = new Map();
  }
}

module.exports = Theme;
