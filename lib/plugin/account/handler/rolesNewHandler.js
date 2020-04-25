"use strict";

const PermissionHandler = require('../../router/handler/permissionHandler');
const Themed = require('../../http/response/themed');

/**
 * Handler for displaying a "create new Role" form to an admin.
 * @class
 * @extends Defiant.Plugin.Router.AdminHandler
 * @memberOf Defiant.Plugin.Account
 */
class RolesNewHandler extends PermissionHandler {
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

    // TODO: Translate.
    context.page.title = 'Create New Account Role';
    const FormApi = context.engine.pluginRegistry.get('FormApi');
    const Form = FormApi.getForm('Account.RolesEditForm');
    const instance = Form.newInstance(context, {});
    await instance.init();
    context.httpResponse = new Themed(context, {
      content: await instance.commit(),
    });
  }
}

RolesNewHandler.permissions = ['account.administerRoles'];
RolesNewHandler.path = 'admin/roles/new';

module.exports = RolesNewHandler;
