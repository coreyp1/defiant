"use strict";

const Handler = require('./handler');

class AdminHandler extends Handler {
  async allowAccess(context) {
    if (context.account && (context.account.id == 1)) {
      return true;
    }
    context.httpResponse = 403;
    return false;
  }
}

module.exports = AdminHandler;
