"use strict";

const Form = require('../../formApi/form');
const Redirect = require('../../http/response/redirect');

class LoginForm extends Form {
  constructor(buildState, ivBase) {
    super(buildState, ivBase);
    this.data.attributes = {
      class: ['login-form'],
      id: ['account-login'],
    };
  }

  async init(context) {
    let FormApi = context.engine.pluginRegistry.get('FormApi'),
        Text = FormApi.getElement('Text'),
        Button = FormApi.getElement('Button'),
        Password = FormApi.getElement('Password'),
        post = context.post[this.name] || {};

    // Build the form here!
    this.addElement(new Text('username', {
        label: {content: 'Username'},
        description: {content: ''},
        defaultValue: '',
        required: true,
      }))
      .addElement(new Password('password', {
        label: 'Password',
        required: true,
      }))
      .addElement(new Button('submit', {value: 'login', content: 'Submit'}));
    return await super.init(context);
  }

  async validate(context) {
    // Simple sanity check.
    if (context.session && context.session.accountId) {
      this.setError(context, '', 'You are already logged in.');
      return Promise.resolve();
    }

    // Reference post variables.
    let post = context.post[this.name];
    let username = post.username;
    let password = post.password;

    // Reference Plugins/Entities.
    let Account = context.engine.pluginRegistry.get('Account');
    let AccountEntity = context.engine.pluginRegistry.get('Orm').entityRegistry.get('account')
    let Username = AccountEntity.attributeRegistry.get('username');
    let Password = AccountEntity.attributeRegistry.get('password');

    // Reference table structures.
    let accountTable = context.engine.sql.define(AccountEntity.schema());
    let usernameTable = context.engine.sql.define(Username.schema());
    let passwordTable = context.engine.sql.define(Password.schema());

    await super.validate(context);

    if (this.validationError) {
      return;
    }

    // Get potential accounts based on the submitted username.
    let query = accountTable
      .select(accountTable.id.as('accountId'), passwordTable.value.as('password'))
      .from (
        accountTable
        .leftJoin(usernameTable)
          .on(usernameTable.parentId.equals(accountTable.id))
        .leftJoin(passwordTable)
          .on(passwordTable.parentId.equals(accountTable.id)))
      .where(
        usernameTable.value.equals(username)
          .and(passwordTable.revisionIdTo.isNull())
      ).toQuery();
    let db = context.engine.database;
    // Execute the query, then move the items into an object keyed by id.
    let rows = await new Promise((accept, reject) => {
      db.all(query.text, ...query.values, (err, rows) => {
        if (rows) {
          return accept(rows);
        }
        return accept(err);
      });
    });

    // Check to see if a password matches.
    for (let row of rows) {
      if (row.password && (await Account.comparePassword(password, row.password))) {
        this.accountId = row.accountId;
      }
    }

    // Set an error if no username and password pair is found.
    if (!this.accountId) {
      this.setError(context, 'username', 'The username and password provided do not match our records.');
      this.setError(context, 'password', '');
    }
  }

  async submit(context) {
    let AccountEntity = context.engine.pluginRegistry.get('Orm').entityRegistry.get('account');

    // The username and password are correct.  Load the Account information.
    context.session.accountId = this.accountId;
    await context.engine.pluginRegistry.get('Session').writeSessionFile(context.session);
    context.account = await AccountEntity.load({id: this.accountId});

    // TODO: Translate.
    // TODO: Escape.
    context.volatile.message.set('loginSuccessful', 'You have been logged in as ' + context.account.username[0].value + '.');

    // Redirect to the front page.
    context.httpResponse = new Redirect(context, 303, '/');
  }
}

module.exports = LoginForm;
