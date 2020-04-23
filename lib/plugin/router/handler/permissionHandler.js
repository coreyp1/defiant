"use strict";

const Handler = require('./handler');

/**
 * Base class for verifying that a account has a specific access permission.
 * @class
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.Router
 */
class PermissionHandler extends Handler {
  /**
   * @constructor
   * @param {Object} data
   *   See the [Handler constructor]{@link Defiant.Plugin.Router.Handler} for
   *   more parameters of the `data` object.
   * @param {String[]} data.permissions
   *   An array of permissions that, if the account has at least one matching
   *   permission, then they are allowed access.
   * @returns {Defiant.Plugin.Router.PermissionHandler}
   *   The instantiated hander.
   */
  constructor(data={}) {
    super(data);
    [
      /**
       * @member {String[]} Defiant.Plugin.Router.PermissionHandler#permissions
       *   An array of permissions that would grant a user access to this
       *   handler.
       */
      'permissions',
    ].map(val => this[val] = data[val] ? data[val] : (this[val] ? this[val] : this.constructor[val]));
  }

  /**
   * Verify that the account has the proper access permissions.
   *
   * If the account does not have access, set the `httpResponse` to 403.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   * @returns {boolean}
   *   Return `true` if the account has access.
   */
  async allowAccess(context) {
    if (!this.Account) {
      // Cache the location to the Account plugin, because this portion of code
      // will be run many, many times!
      this.Account = context.engine.pluginRegistry.get('Account');
    }
    for (let permission of (this.permissions || [])) {
      if (await this.Account.accountHasPermission(context.account, permission)) {
        return true;
      }
    }
    // Give the user an Access Denied code.
    context.httpResponse = 403;
    return false;
  }
}

/**
 * @prop {String[]} Defiant.Plugin.Router.Handler.permissions
 *   An array of permissions that this handler will validate.
 */
PermissionHandler.permissions = [];

module.exports = PermissionHandler;
