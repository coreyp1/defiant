"use strict";

const PermissionHandler = require('../../router/handler/permissionHandler');
const Themed = require('../../http/response/themed');

class RolesEditHandler extends PermissionHandler {
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
