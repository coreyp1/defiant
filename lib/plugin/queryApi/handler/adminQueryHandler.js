"use strict"

const QueryHandler = require('./queryHandler');
const AdminHandler = require('../../router/handler/adminHandler');

class AdminQueryHandler extends QueryHandler {}

// Use the AdminHandler function to control Access.
AdminQueryHandler.prototype.allowAccess = AdminHandler.prototype.allowAccess;

module.exports = AdminQueryHandler;
