"use strict";

class Handler {
  constructor(context, next) {
    next();
  }
}

module.exports = Handler;
