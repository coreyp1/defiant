"use strict";

const Form = require('../../fapi/form');
const Redirect = require('../../http/response/redirect');
const {coroutine: co, promisify} = require('bluebird');

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
          required: true,
        }))
        .addElement(new Password('password', {
          label: 'Password',
          required: true,
        }))
        .addElement(new Button('submit', {value: 'login', content: 'Submit'}));
      return yield superInit.call(self, context);
    })(this, super.init);
  }

  validate(context) {
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
    let Account = context.engine.plugin.get('Account');
    let AccountEntity = context.engine.plugin.get('Orm').entity.get('account')
    let Username = AccountEntity.attributes.get('username');
    let Password = AccountEntity.attributes.get('password');

    // Reference table structures.
    let accountTable = context.engine.sql.define(AccountEntity.schema());
    let usernameTable = context.engine.sql.define(Username.schema());
    let passwordTable = context.engine.sql.define(Password.schema());

    return super.validate(context).then(() => co(function*(self){
      if (self.validationError) {
        return Promise.resolve();
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
      let dball = promisify(db.all, {context: db});
      // Execute the query, then move the items into an object keyed by id.
      let rows = yield dball(query.text, ...query.values);

      // Check to see if a password matches.
      for (let row of rows) {
        if (row.password && (yield Account.comparePassword(password, row.password))) {
          self.accountId = row.accountId;
        }
      }

      // Set an error if no username and password pair is found.
      if (!self.accountId) {
        self.setError(context, 'username', 'The username and password provided do not match our records.');
        self.setError(context, 'password', '');
      }
    })(this));
  }

  submit(context) {
    let AccountEntity = context.engine.plugin.get('Orm').entity.get('account');
    return co(function*(self){
      // The username and password are correct.  Load the Account information.
      context.session.accountId = self.accountId;
      yield context.engine.plugin.get('Session').writeSessionFile(context.session);
      context.account = yield AccountEntity.load({id: self.accountId});

      // TODO: Translate.
      // TODO: Escape.
      context.volatile.message.set('loginSuccessful', 'You have been logged in as ' + context.account.username[0].value + '.');

      // Redirect to the front page.
      context.httpResponse = new Redirect(context, 303, '/');
    })(this);
  }
}

module.exports = LoginForm;
