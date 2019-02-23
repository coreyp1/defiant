"use strict";

const FormInstance = require('../../formApi/formInstance');
const Redirect = require('../../http/response/redirect');

class LoginFormInstance extends FormInstance {
  constructor(renderable, setup, context) {
    super(renderable, setup, context);
    this.data.attributes.id.add('account-login');
    this.data.attributes.class.add('login-form');
  }

  async init(data={}) {
    const FormApi = this.context.engine.pluginRegistry.get('FormApi');
    const Text = FormApi.getElement('Text');
    const Password = FormApi.getElement('Password');
    const Button = FormApi.getElement('Button');
    // Build the form here!
    this.addInstance(Text.newInstance(this.context, {
        name: 'username',
        data: {
          label: 'Username',
          description: '',
          defaultValue: '',
          required: true,
        },
      }))
      .addInstance(Password.newInstance(this.context, {
        name: 'password',
        data: {
          label: 'Password',
          required: true,
        },
      }))
      .addInstance(Button.newInstance(this.context, {
        name: 'submit',
        data: {
          value: 'login',
          content: 'Submit',
        },
      }));
    await super.init(data);
  }

  async validate() {
    // Simple sanity check.
    if (this.context.session && this.context.session.accountId) {
      this.setError('', 'You are already logged in.');
      return Promise.resolve();
    }

    // Reference post variables.
    let post = this.context.post[this.name];
    let username = post.username;
    let password = post.password;

    // Reference Plugins/Entities.
    let Account = this.context.engine.pluginRegistry.get('Account');
    let AccountEntity = this.context.engine.pluginRegistry.get('Orm').entityRegistry.get('account')
    let Username = AccountEntity.attributeRegistry.get('username');
    let Password = AccountEntity.attributeRegistry.get('password');

    // Reference table structures.
    let accountTable = this.context.engine.sql.define(AccountEntity.schema());
    let usernameTable = this.context.engine.sql.define(Username.schema());
    let passwordTable = this.context.engine.sql.define(Password.schema());

    await super.validate();

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
    let db = this.context.engine.database;
    // Execute the query, then move the items into an object keyed by id.
    let rows = await new Promise((accept) => {
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
      this.setError('username', 'The username and password provided do not match our records.');
      this.setError('password', '');
    }
  }

  async submit() {
    let AccountEntity = this.context.engine.pluginRegistry.get('Orm').entityRegistry.get('account');

    // The username and password are correct.  Load the Account information.
    this.context.session.accountId = this.accountId;
    await this.context.engine.pluginRegistry.get('Session').writeSessionFile(this.context.session);
    this.context.account = await AccountEntity.load({id: this.accountId});

    // TODO: Translate.
    // TODO: Escape.
    this.context.volatile.message.set('loginSuccessful', 'You have been logged in as ' + this.context.account.username[0].value + '.');

    // Redirect to the front page.
    this.context.httpResponse = new Redirect(this.context, 303, '/');
  }
}

module.exports = LoginFormInstance;
