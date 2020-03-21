"use strict";

const PermissionHandler = require('./permissionHandler');

/**
 * @class
 * @extends Defiant.Plugin.Router.Handler.PermissionHandler
 * @memberOf Defiant.Plugin.Router.Handler
 */
class AdminHandler extends PermissionHandler {}

AdminHandler.permissions = ['.admin'];

module.exports = AdminHandler;
