"use strict"

const QueryHandler = require('./queryHandler');
const AdminHandler = require('../../router/handler/adminHandler');

/**
 * Handler for queries intended for use in the admin pages.
 * @class
 * @extends Defiant.Plugin.QueryApi.QueryHandler
 * @memberOf Defiant.Plugin.QueryApi
 */
class AdminQueryHandler extends QueryHandler {
  constructor(data={}) {
    super(data);
    [
      /**
       * @member {String[]} Defiant.Plugin.QueryApi.AdminQueryHandler#permissions
       *   An array of permissions that would grant a user access to this
       *   handler.
       */
      'permissions',
    ].map(val => this[val] = data[val] ? data[val] : (this[val] ? this[val] : this.constructor[val]));
  }
}

// Use the AdminHandler function to control Access.
AdminQueryHandler.prototype.allowAccess = AdminHandler.prototype.allowAccess;
AdminQueryHandler.permissions = AdminHandler.permissions;

module.exports = AdminQueryHandler;
