"use strict";

const PermissionHandler = require('./permissionHandler');

/**
 * @class
 * @extends Defiant.Plugin.Router.PermissionHandler
 * @memberOf Defiant.Plugin.Router
 */
class AdminHandler extends PermissionHandler {}

AdminHandler.permissions = ['.admin'];

module.exports = AdminHandler;
