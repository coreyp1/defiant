"use strict"

const QueryHandler = require('./queryHandler');
const AdminHandler = require('../../router/handler/adminHandler');

class AdminQueryHandler extends QueryHandler {}

AdminQueryHandler.allowAccess = AdminHandler.allowAccess;

module.exports = AdminQueryHandler;
