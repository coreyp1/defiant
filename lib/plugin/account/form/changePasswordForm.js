"use strict";

const Form = require('../../formApi/form');
const Redirect = require('../../http/response/redirect');

class ChangePasswordForm extends Form {
  constructor(buildState, ivBase) {
    super(buildState, ivBase);
    this.data.attributes = {
      class: ['change-password-form'],
      id: ['account-change-password'],
    };
  }

  async init(context) {
    let FormApi = context.engine.pluginRegistry.get('FormApi'),
        Button = FormApi.getElement('Button'),
        Password = FormApi.getElement('Password');

    // Build the form here!
    this.addElement(new Password('password', {
        label: 'Old Password',
        required: true,
      }))
      .addElement(new Password('newPassword1', {
        label: 'New Password',
        required: true,
      }))
      .addElement(new Password('newPassword2', {
        label: 'Confirm New Password',
        required: true,
      }))
      .addElement(new Button('submit', {value: 'changePassword', content: 'Change Password'}));
    return await super.init(context);
  }

  async validate(context) {
    // Simple sanity check.
    if (!context.account || !context.account.id) {
      this.setError(context, 'account', 'You must be logged in to use this form.');
      return Promise.resolve();
    }

    await super.validate(context);

    if (this.validationError) {
      return Promise.resolve();
    }

    // Reference post variables.
    let post = context.post[this.name];
    let oldPassword = post.password;
    let newPassword1 = post.newPassword1;
    let newPassword2 = post.newPassword2;

    // Ensure that the password is actually being changed.
    if (oldPassword == newPassword1) {
      this.setError(context, 'newPassword1', 'Your new password cannot be the same as your old password.');
      return Promise.resolve();
    }

    // Ensure that the new password was typed correctly twice.
    if (newPassword1 != newPassword2) {
      this.setError(context, 'newPassword2', 'The new passwords do not match.');
      return Promise.resolve();
    }

    // Reference Plugins/Entities.
    let Account = context.engine.pluginRegistry.get('Account');

    // Determine if the "old password" matches.
    for (let index in context.account.password) {
      if (await Account.comparePassword(oldPassword, context.account.password[index].value)) {
        this.replacePassword = context.account.password[index];
        break;
      }
    }
    if (!this.replacePassword) {
      this.setError(context, 'password', 'This password does not match our records.');
    }
  }

  async  submit(context) {
    // Reference Plugins/Entities.
    let Account = context.engine.pluginRegistry.get('Account');
    let AccountEntity = context.engine.pluginRegistry.get('Orm').entityRegistry.get('account')

    // Set the new password.
    this.replacePassword.value = await Account.hashPassword(context.post[this.name].newPassword1);

    // Save the Account entity (returns a Promise).
    await AccountEntity.save(context.account);

    // TODO: Translate.
    context.volatile.message.set('passwordChangeSuccess', 'Your password has been updated.');

    // Redirect to the front page.
    context.httpResponse = new Redirect(context, 303, '/');
  }
}

module.exports = ChangePasswordForm;
