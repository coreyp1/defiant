"use strict";

const Form = require('../../fapi/form');
const {coroutine: co} = require('bluebird');

class LoginForm extends Form {
  init(context) {
    let fapi = context.engine.plugin.get('Fapi'),
        Text = fapi.getElement('Text'),
        Button = fapi.getElement('Button'),
        Password = fapi.getElement('Password'),
        post = context.post[this.name] || {};

    return co(function*(self, superInit) {
      // Build the form here!
      self.addElement(new Text('username', {
          label: {content: 'Username'},
          description: {content: ''},
          defaultValue: '',
        }))
        .addElement(new Password('password', {
          label: 'Password',
        }))
        .addElement(new Button('submit', {value: 'login', content: 'Submit'}));
      return yield superInit.call(self, context);
    })(this, super.init);
  }

  validate(context) {
    // In the event of an error, set context.fapiError = true;
    // -- OR --
    // this.setError(context, elementName, message);
    return Promise.resolve();
  }

  submit(context) {
    let post = context.post[this.name];
    let username = post.username;
    let password = post.password;
    return Promise.resolve();
  }
}

module.exports = LoginForm;
