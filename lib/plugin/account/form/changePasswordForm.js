"use strict";

const Form = require('../../formApi/form');
const Redirect = require('../../http/response/redirect');
const {coroutine: co, promisify} = require('bluebird');

class ChangePasswordForm extends Form {
  constructor(buildState, ivBase) {
    super(buildState, ivBase);
    this.data.attributes = {
      class: ['change-password-form'],
      id: ['account-change-password'],
    };
  }

  init(context) {
    let FormApi = context.engine.plugin.get('FormApi'),
        Button = FormApi.getElement('Button'),
        Password = FormApi.getElement('Password'),
        post = context.post[this.name] || {};

    return co(function*(self, superInit) {
      // Build the form here!
      self.addElement(new Password('password', {
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
      return yield superInit.call(self, context);
    })(this, super.init);
  }

  validate(context) {
    // Simple sanity check.
    if (!context.account || !context.account.id) {
      this.setError(context, 'account', 'You must be logged in to use this form.');
      return Promise.resolve();
    }

    return super.validate(context).then(() => co(function*(self){
      if (self.validationError) {
        return Promise.resolve();
      }

      // Reference post variables.
      let post = context.post[self.name];
      let oldPassword = post.password;
      let newPassword1 = post.newPassword1;
      let newPassword2 = post.newPassword2;

      // Ensure that the password is actually being changed.
      if (oldPassword == newPassword1) {
        self.setError(context, 'newPassword1', 'Your new password cannot be the same as your old password.');
        return Promise.resolve();
      }

      // Ensure that the new password was typed correctly twice.
      if (newPassword1 != newPassword2) {
        self.setError(context, 'newPassword2', 'The new passwords do not match.');
        return Promise.resolve();
      }

      // Reference Plugins/Entities.
      let Account = context.engine.plugin.get('Account');

      // Determine if the "old password" matches.
      for (let index in context.account.password) {
        if (yield Account.comparePassword(oldPassword, context.account.password[index].value)) {
          self.replacePassword = context.account.password[index];
          break;
        }
      }
      if (!self.replacePassword) {
        self.setError(context, 'password', 'This password does not match our records.');
      }
    })(this));
  }

  submit(context) {
    // Reference Plugins/Entities.
    let Account = context.engine.plugin.get('Account');
    let AccountEntity = context.engine.plugin.get('Orm').entity.get('account')

    return co(function*(self){
      // Set the new password.
      self.replacePassword.value = yield Account.hashPassword(context.post[self.name].newPassword1);

      // Save the Account entity (returns a Promise).
      yield AccountEntity.save(context.account);

      // TODO: Translate.
      context.volatile.message.set('passwordChangeSuccess', 'Your password has been updated.');

      // Redirect to the front page.
      context.httpResponse = new Redirect(context, 303, '/');
    })(this);
  }
}

module.exports = ChangePasswordForm;
