"use strict";

const bcrypt = require('bcrypt');
const Plugin = require('../plugin');
const Handler = require('../router/handler/handler');
const AdminHandler = require('../router/handler/adminHandler');
const Form = require('../formApi/form');
const Data = require('../settings/data');
const Path = require('path');

class Account extends Plugin {
  constructor(engine) {
    super(engine);

    const FormApi = engine.pluginRegistry.get('FormApi');

    // Declare the Forms.
    FormApi
      .setForm(new Form(engine, {
        id: 'LoginForm',
        Instance: require('./form/loginFormInstance'),
      }))
      .setForm(new Form(engine, {
        id: 'ChangePasswordForm',
        Instance: require('./form/changePasswordFormInstance'),
      }))
      .setForm(new Form(engine, {
        id: 'Account.PermissionForm',
        Instance: require('./form/permissionFormInstance'),
      }))
      .setForm(new Form(engine, {
        id: 'Account.RolesEditForm',
        Instance: require('./form/rolesEditFormInstance'),
      }));

    // Declare the Router Handlers.
    engine.pluginRegistry.get('Router')
      // Change Password Handler
      .addHandler(new Handler({
        id: 'Account.ChangePasswordHandler',
        path: 'password',
        // TODO: Translate.
        menu: {
          menu: 'default',
          text: 'Change Password',
          description: 'Change your password',
        },
        renderable: FormApi.getForm('ChangePasswordForm'),
        allowAccess: function allowAccess(context) {
          if (context.account && context.account.id) {
            return Promise.resolve(true);
          }
          context.httpResponse = 403;
          return Promise.resolve(false);
        },
      }))
      // Login Handler
      .addHandler(new Handler({
        id: 'Account.LoginHandler',
        path: 'login',
        // TODO: Translate.
        menu: {
          menu: 'default',
          text: 'Login',
          description: 'Login to this website',
        },
        renderable: FormApi.getForm('LoginForm'),
        allowAccess: function allowAccess(context) {
          if (!context.account) {
            return Promise.resolve(true);
          }
          context.httpResponse = 403;
          return Promise.resolve(false);
        },
      }))
      .addHandler(new (require('./handler/logoutHandler'))())
      .addHandler(new (require('./handler/accountLoadHandler'))())
      .addHandler(new (require('./handler/accountHandler'))())
      .addHandler(new (require('./handler/accountsHandler'))())
      .addHandler(new AdminHandler({
        id: 'Account.Permissions',
        path: 'admin/permissions',
        menu: {
          menu: 'admin',
          text: 'Edit Permissions',
          description: 'Choose the permissions to associate with a user role',
        },
        renderable: FormApi.getForm('Account.PermissionForm'),
      }))
      .addHandler(new(require('./handler/rolesHandler'))())
      .addHandler(new(require('./handler/rolesEditHandler'))());

    // Declare the Entities.
    let AccountEntity = require('./entity/accountEntity');
    let account = new AccountEntity(engine, 'account');
    engine.pluginRegistry.get('Orm').entityRegistry.set(account);

    // Declare the Queries.
    let QueryApi = engine.pluginRegistry.get('QueryApi');
    QueryApi.queryRegistry
      .set(new(require('./query/accountQuery'))())
      .set(new(require('./query/accountsQuery'))());

    // Declare the Permissions Data objects.
    const Settings = engine.pluginRegistry.get('Settings');
    Settings.cacheRegistry.set(new Data({
      id: 'account/role.json',
      filename: Path.join('account', 'role.json'),
      storage: 'settings',
      storageCanChange: true,
      description: 'This contains the roles available on the system',
      default: {
        administrator: {
          weight: -1,
          title: 'Administrator',
          description: 'The user is the site administrator.',
        },
        authorized: {
          weight: 0,
          title: 'Authorized User',
          description: 'The user has an account and is logged in.',
          automatic: true,
        },
        anonymous: {
          weight: 1,
          title: 'Anonymous User',
          description: 'The user is not logged in.',
          automatic: true,
        },
      },
    }));
    this.role = Settings.cacheRegistry.get('account/role.json');

    // Declare permissions.
    Settings.cacheRegistry.set(new Data({
      id: 'account/permissionArray.json',
      filename: Path.join('account', 'permissionArray.json'),
      storage: 'settings',
      storageCanChange: true,
      description: 'This contains the permissions associated with account roles',
      default: {},
    }));
    this.permissionArray = Settings.cacheRegistry.get('account/permissionArray.json');
    this.permissionSet = {};
    this.permission = {
      'account.administer': {
        title: 'Administer Accounts',
        description: 'Allows creating users and editing their account data',
      },
      'account.view': {
        title: 'View Accounts',
        description: 'User can view other accounts',
      },
      'account.editOwn': {
        title: 'Edit Own Account',
        description: 'User can edit their own account',
      },
      'account.administerRoles': {
        title: 'Administer Roles',
        description: 'Allows creating and editing the types of Roles available',
      },
    };
  }

  async init() {
    // Check to see if Accout Id 1 exists.
    let AccountEntity = this.engine.pluginRegistry.get('Orm').entityRegistry.get('account');
    let account = await AccountEntity.load({id:1});
    if (!account) {
      // Create a default admin account.
      // TODO: Default the password to a UUID.
      let password = 'foo';
      account = await AccountEntity.save({
        username: [{value: 'admin'}],
        password: [{value: await this.hashPassword(password)}],
      });
      console.log(`Account "admin" created, password: "${password}"`);
    }

    await this.role.load();
    await this.permissionArray.load();
    this.parsePermissions();
  }

  hashPassword(password) {
    // Returns a Promise from bcrypt.
    // Uses a default rounds cost of 14.
    return bcrypt.hash(password, 14);
  }

  comparePassword(plaintextPassword, hashedPassword) {
    // Returns a Promise from bcrypt.
    return bcrypt.compare(plaintextPassword, hashedPassword);
  }

  /**
   * Converts the arrays of permissionArray to sets.  This is necessary because
   * sets are faster for roleHasPermission(), but sets are not supported by
   * JSON, which is used by the Data object.
   */
  parsePermissions() {
    this.permissionSet = {};
    for (let role of Object.keys(this.role.data)) {
      this.permissionSet[role] = new Set(this.permissionArray.data[role]);
    }
  }

  async accountHasPermission(account, permission) {
    if (account) {
      if (account.id) {
        if (account.id == 1) {
          // Account 1 is the superadmin, and can access everything.
          return true;
        }
        if (await this.roleHasPermission('authorized', permission)) {
          return true;
        }
        for (let role of (account.role || [])) {
          if (await this.roleHasPermission(role.value, permission)) {
            return true;
          }
        }
        return false;
      }
    }
    return await this.roleHasPermission('anonymous', permission);
  }

  async roleHasPermission(role, permission) {
    if (this.permissionSet[role]) {
      return this.permissionSet[role].has(permission);
    }
    return false;
  }
}

module.exports = Account;
