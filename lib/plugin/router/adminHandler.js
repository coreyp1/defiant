"use strict";

const Handler = require('./handler');

class AdminHandler extends Handler {
  canAccess(context) {
    return Promise.resolve(context.account && (context.account.id == 1));
  }
}

module.exports = AdminHandler;
