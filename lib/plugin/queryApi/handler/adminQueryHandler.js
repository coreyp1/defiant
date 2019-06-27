"use strict"

const QueryHandler = require('./queryHandler');
const AdminHandler = require('../../router/handler/adminHandler');

class AdminQueryHandler extends QueryHandler {
  constructor(data={}) {
    super(data);
    ['permissions'].map(val => this[val] = data[val] ? data[val] : (this[val] ? this[val] : this.constructor[val]));
  }
}

// Use the AdminHandler function to control Access.
AdminQueryHandler.prototype.allowAccess = AdminHandler.prototype.allowAccess;
AdminQueryHandler.permissions = AdminHandler.permissions;

module.exports = AdminQueryHandler;
