"use strict";

const FormInstance = require('../../formApi/formInstance');
const merge = require('../../../util/merge');

class RolesEditFormInstance extends FormInstance {
  async init() {
    const Account = this.context.engine.pluginRegistry.get('Account');
    const FormApi = this.context.engine.pluginRegistry.get('FormApi');
    const Text = FormApi.getElement('Text');
    const Textarea = FormApi.getElement('Textarea');
    const Button = FormApi.getElement('Button');

    const roleKey = (this.buildState && this.buildState.roleKey)
      ? this.buildState.roleKey
      : undefined;
    const role = Account.role.data[roleKey] ? Account.role.data[roleKey] : {};

    if (!Object.getOwnPropertyNames(role).length) {
      this.addInstance(Text.newInstance(this.context, {
        name: 'roleKey',
        description: 'A machine-friendly identifier for this role.',
      }));
    }
    this
      .addInstance(Text.newInstance(this.context, {
        name: 'title',
        data: {
          label: 'Role Title',
          description: 'The user-friendly name for this role that may be exposed to Users.',
          defaultValue: role.title || '',
        },
      }))
      .addInstance(Textarea.newInstance(this.context, {
        name: 'description',
        data: {
          label: 'Description',
          description: 'Give a description of this role.',
          defaultValue: role.description || '',
        },
      }))
      .addInstance(Button.newInstance(this.context, {
        name: 'update',
        data: {
          value: 'update',
          content: 'Update',
        },
      }))

    await super.init();
  }

  async submit() {
    const Account = this.context.engine.pluginRegistry.get('Account');
    const post = this.context.post[this.id];
    const roleKey = this.buildState.roleKey || post.roleKey;
    Account.role.data[roleKey] = merge(Account.role.data[roleKey] || {}, {
      title: post.title,
      description: post.description,
    });
    await Account.role.save();
    delete this.context.post[this.id];
  }
}

module.exports = RolesEditFormInstance;
