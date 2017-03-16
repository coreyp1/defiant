"use strict";

const Form = require('../../fapi/form');
const {coroutine: co} = require('bluebird');

class LoginForm extends Form {
  init(context) {
    let fapi = context.engine.plugin.get('Fapi'),
        Text = fapi.getElement('Text'),
        Button = fapi.getElement('Button'),
        Hidden = fapi.getElement('Hidden'),
        Encrypted = fapi.getElement('Encrypt'),
        Static = fapi.getElement('Static'),
        Checkboxes = fapi.getElement('Checkboxes'),
        Radios = fapi.getElement('Radios'),
        Select = fapi.getElement('Select'),
        Password = fapi.getElement('Password'),
        Textarea = fapi.getElement('Textarea'),
        Fieldset = fapi.getElement('Fieldset'),
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
}

module.exports = LoginForm;
