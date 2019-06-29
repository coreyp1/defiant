"use strict";

const PermissionHandler = require('../../router/handler/permissionHandler');
const Themed = require('../../http/response/themed');

class RolesNewHandler extends PermissionHandler {
  async init(context) {
    await super.init(context);

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
