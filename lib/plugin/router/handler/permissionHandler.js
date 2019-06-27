"use strict";

const Handler = require('./handler');

class PermissionHandler extends Handler {
  constructor(data={}) {
    super(data);
    ['permissions'].map(val => this[val] = data[val] ? data[val] : (this[val] ? this[val] : this.constructor[val]));
  }

  async allowAccess(context) {
    if (!this.Account) {
      // Cache the location to the Account plugin, because this portion of code
      // will be run many, many times!
      this.Account = context.engine.pluginRegistry.get('Account');
    }
    for (let permission of this.permissions) {
      if (await this.Account.accountHasPermission(context.account, permission)) {
        return true;
      }
    }
    // Give the user an Access Denied code.
    context.httpResponse = 403;
    return false;
  }
}

PermissionHandler.permissions = [];

module.exports = PermissionHandler;
