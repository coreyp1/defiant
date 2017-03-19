"use strict";

const Form = require('../../fapi/form');
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

  // TODO: Move most of this into a validation step.
  submit(context) {
    // Simple sanity check.
    if (context.session.accountId) {
      return Promise.resolve();
    }

    // Reference post variables.
    let post = context.post[this.name];
    let username = post.username;
    let password = post.password;

    // Reference Plugins/Entities.
    let Account = context.engine.plugin.get('Account');
    let AccountEntity = context.engine.orm.entity.get('account')
    let Username = AccountEntity.attributes.get('username');
    let Password = AccountEntity.attributes.get('password');

    // Reference table structures.
    let accountTable = context.engine.sql.define(AccountEntity.schema());
    let usernameTable = context.engine.sql.define(Username.schema());
    let passwordTable = context.engine.sql.define(Password.schema());

    return co(function*(self){
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
          context.session.accountId = row.accountId;
          yield context.engine.plugin.get('Session').writeSessionFile(context.session);
          context.account = yield AccountEntity.load({id: row.accountId});
        }
      }
    })(this);
  }
}

module.exports = LoginForm;
