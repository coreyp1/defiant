"use strict";

const Handler = require('./handler');

class AdminHandler extends Handler {
  allowAccess(context) {
    if (context.account && (context.account.id == 1)) {
      return Promise.resolve(true);
    }
    context.httpResponse = 403;
    return Promise.resolve(false);
  }
}

module.exports = AdminHandler;
