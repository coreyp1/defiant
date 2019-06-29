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
    const newRole = !Object.getOwnPropertyNames(role).length;

    if (newRole) {
      this.addInstance(Text.newInstance(this.context, {
        name: 'roleKey',
        data: {
          label: 'Machine Name',
          description: 'A machine-friendly identifier for this role.  This will be used internally, and cannot be changed in the future.',
          required: true,
        },
      }));
    }
    this
      .addInstance(Text.newInstance(this.context, {
        name: 'title',
        data: {
          label: 'Role Title',
          description: 'The user-friendly name for this role that may be exposed to Users.',
          defaultValue: role.title || '',
          required: true,
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
          content: newRole ? 'Create' : 'Update',
        },
      }))

    await super.init();
  }

  async validate() {
    // TODO: Translate.
    const Account = this.context.engine.pluginRegistry.get('Account');
    const post = this.context.post[this.id];
    if (post.roleKey) {
      // The roleKey must be unique.
      if (Account.role.data[post.roleKey] !== undefined) {
        this.setError('roleKey', 'The Machine Name is not unique.');
      }
    }

    await super.validate();
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
    // TODO: Translate.
    // TODO: Escape.
    if (this.buildState.roleKey) {
      this.context.volatile.message.set('roleUpdated', `The role ${Account.role.data[roleKey].title} has been updated.`);
    }
    else {
      this.context.volatile.message.set('roleCreated', `The role ${Account.role.data[roleKey].title} has been created.`);
    }

    delete this.context.post[this.id];
    await super.submit();
  }
}

RolesEditFormInstance.redirect = 'admin/role';

module.exports = RolesEditFormInstance;
