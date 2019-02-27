"use strict";

const FormInstance = require('../../formApi/formInstance');
const Redirect = require('../../http/response/redirect');

class ChangePasswordFormInstance extends FormInstance {
  constructor(renderable, setup, context) {
    super(renderable, setup, context);
    this.data.attributes.id.add('account-change-password');
    this.data.attributes.class.add('change-password-form');
  }

  async init(data={}) {
    let FormApi = this.context.engine.pluginRegistry.get('FormApi'),
        Button = FormApi.getElement('Button'),
        Password = FormApi.getElement('Password');

    // Build the form here!
    this.addInstance(Password.newInstance(this.context, {
        name: 'password',
        data: {
          label: 'Old Password',
          required: true,
        },
      }))
      .addInstance(Password.newInstance(this.context, {
        name: 'newPassword1',
        data: {
          label: 'New Password',
          required: true,
        },
      }))
      .addInstance(Password.newInstance(this.context, {
        name: 'newPassword2',
        data: {
          label: 'Confirm New Password',
          required: true,
        },
      }))
      .addInstance(Button.newInstance(this.context, {
        name: 'submit',
        data: {
          value: 'changePassword',
          content: 'Change Password',
        },
      }));
    await super.init(data);
  }

  async validate() {
    // Simple sanity check.
    if (!this.context.account || !this.context.account.id) {
      this.setError('account', 'You must be logged in to use this form.');
      return;
    }

    await super.validate();

    if (this.validationError) {
      return;
    }

    // Reference post variables.
    let post = this.context.post[this.id];
    let oldPassword = post.password;
    let newPassword1 = post.newPassword1;
    let newPassword2 = post.newPassword2;

    // Ensure that the password is actually being changed.
    if (oldPassword == newPassword1) {
      this.setError('newPassword1', 'Your new password cannot be the same as your old password.');
      return;
    }

    // Ensure that the new password was typed correctly twice.
    if (newPassword1 != newPassword2) {
      this.setError('newPassword2', 'The new passwords do not match.');
      return;
    }

    // Reference Plugins/Entities.
    let Account = this.context.engine.pluginRegistry.get('Account');

    // Determine if the "old password" matches.
    for (let index in this.context.account.password) {
      if (await Account.comparePassword(oldPassword, this.context.account.password[index].value)) {
        this.replacePassword = this.context.account.password[index];
        break;
      }
    }
    if (!this.replacePassword) {
      this.setError('password', 'This password does not match our records.');
    }
  }

  async submit() {
    // Reference Plugins/Entities.
    let Account = this.context.engine.pluginRegistry.get('Account');
    let AccountEntity = this.context.engine.pluginRegistry.get('Orm').entityRegistry.get('account')

    // Set the new password.
    this.replacePassword.value = await Account.hashPassword(this.context.post[this.id].newPassword1);

    // Save the Account entity (returns a Promise).
    await AccountEntity.save(this.context.account);

    // TODO: Translate.
    this.context.volatile.message.set('passwordChangeSuccess', 'Your password has been updated.');

    // Redirect to the front page.
    this.context.httpResponse = new Redirect(this.context, 303, '/');
  }
}

module.exports = ChangePasswordFormInstance;
