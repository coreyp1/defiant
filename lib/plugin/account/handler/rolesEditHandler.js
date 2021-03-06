"use strict";

const PermissionHandler = require('../../router/handler/permissionHandler');
const Themed = require('../../http/response/themed');

/**
 * Handler for displaying the Roles edit form.
 * @class
 * @extends Defiant.Plugin.Router.PermissionHandler
 * @memberOf Defiant.Plugin.Account
 */
class RolesEditHandler extends PermissionHandler {
  /**
   * A request has been made.  Process the request and provide the necessary
   * [Renderable]{@link Defiant.Plugin.Theme.Renderable}.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
    await super.init(context);

    const Account = context.engine.pluginRegistry.get('Account');
    const FormApi = context.engine.pluginRegistry.get('FormApi');
    const Form = FormApi.getForm('Account.RolesEditForm');
    const roleKey = context.request.urlTokenized[2];
    const role = Account.role.data;

    if (role[roleKey] && !role[roleKey].automatic) {
      // TODO: Translate.
      context.page.title = 'Update Account Role';
      const instance = Form.newInstance(context, {buildState: {roleKey}});
      await instance.init();
      context.httpResponse = new Themed(context, {
        content: await instance.commit(),
      });
    }
    else {
      context.httpResponse = 404;
    }
  }
}

RolesEditHandler.permissions = ['account.administerRoles'];
RolesEditHandler.path = 'admin/roles/*/edit';

module.exports = RolesEditHandler;
