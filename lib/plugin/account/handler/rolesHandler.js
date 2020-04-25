"use strict";

const AdminHandler = require('../../router/handler/adminHandler');
const Themed = require('../../http/response/themed');

/**
 * Handler for displaying a list of Roles to an admin.
 * @class
 * @extends Defiant.Plugin.Router.AdminHandler
 * @memberOf Defiant.Plugin.Account
 */
class RolesHandler extends AdminHandler {
  /**
   * A request has been made.  Process the request and provide the necessary
   * [Renderable]{@link Defiant.Plugin.Theme.Renderable}.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
    let Account = context.engine.pluginRegistry.get('Account');

    let automaticRoles = [];
    // TODO: Translate
    let roleTable = '<table id="account-admin-roles"><thead><tr><th colspan=2>Role</th><th>Description</th></tr></thead><tbody>';
    for (let roleKey in Account.role.data) {
      let role = Account.role.data[roleKey];
      if (role.automatic) {
        // Only list the automatic Roles.
        automaticRoles.push(roleKey);
      }
      else {
        roleTable += `<tr><th class="role-name">${role.title}</th>
          <td><a href="/admin/roles/${roleKey}/edit">edit</a></td>
          <td>${role.description}</td></tr>`;
      }
    }

    roleTable += '</tbody></table>';

    let content = `<a href="/admin/roles/new">Create a new Role</a><br />${roleTable}`;
    context.httpResponse = new Themed(context, {
      content: content,
    });
  }
}

RolesHandler.id = 'Account.RolesHandler';
RolesHandler.path = 'admin/roles';
// TODO: Translate
RolesHandler.menu = {
  menu: 'admin',
  text: 'Roles',
  description: 'Administer Role Types',
};

module.exports = RolesHandler;
