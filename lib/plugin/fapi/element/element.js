"use strict";

const Collection = require('../../theme/renderable/collection');

class Element extends Collection {
  constructor(name) {
    super();
    this.name = name;
  }
}

module.exports = Element;
