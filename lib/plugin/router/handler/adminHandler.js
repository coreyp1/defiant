"use strict";

const PermissionHandler = require('./permissionHandler');

class AdminHandler extends PermissionHandler {}

AdminHandler.permissions = ['.admin'];

module.exports = AdminHandler;
