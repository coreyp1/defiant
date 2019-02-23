"use strict";

const Form = require('../../formApi/form');

class LoginForm extends Form {
  constructor(engine, setup={}) {
    super(engine, setup);
    this.instanceSetup.data.attributes.id.add('account-login');
    this.instanceSetup.data.attributes.class.add('login-form');
  }
}

LoginForm.Instance = require('./loginFormInstance');

module.exports = LoginForm;
