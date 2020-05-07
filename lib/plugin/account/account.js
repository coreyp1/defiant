"use strict";

const bcrypt = require('bcrypt');
const Plugin = require('../plugin');
const Handler = require('../router/handler/handler');
const AdminHandler = require('../router/handler/adminHandler');
const Form = require('../formApi/form');
const Data = require('../settings/data');
const Path = require('path');

/**
 * The Account plugin provides functionality for managing user accounts on the
 * Defiant framework.  Accounts are [Entities]{@link Defiant.Plugin.Orm.Entity},
 * and have username and password support as well as login, logout, and change
 * password functionality.
 *
 * Predefined [Queries]{@link Defiant.Plugin.QueryApi.Query} have been supplied
 * to provide a single account page as well as administrative listings of
 * accounts.
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Plugin
 */
class Account extends Plugin {
  /**
   * @function
   * @async
   * @param {Defiant.Plugin} plugin
   *   The Plugin to which the `action` pertains.
   * @param {String} action
   *   The action being performed.  Example actions include "pre-enable",
   *   "enable", "disable", "update".
   * @param {Mixed} [data=NULL]
   *   Any supplementary information.
   */
  async notify(plugin, action, data=null) {
    super.notify(plugin, action, data);
    switch (action) {
      case 'pre:enable':
        /**
         * @member {Defiant.Plugin.Settings.Data} Defiant.Plugin.Account#role
         *   The roles that have been defined that may be assigned to various users.
         */
        this.role = undefined;

        /**
         * @member {Defiant.Plugin.Settings.Data} Defiant.Plugin.Account#permissionArray
         *   Contains the permissions associated with the various account roles.
         *   This will be expanded into the `permissionSet` variable.  See
         *   [parsePermissions]{@link Defiant.Plugin.Account.parsePermissions} for
         *   more informatioin.
         */
        this.permissionArray = undefined;

        /**
         * @member {Map<String,Set<String>>} Defiant.Plugin.Account#permissionSet
         *   Maps an account type (the key, a string) to a Set of permissions which
         *   have been assigned to that role (the value, a Set of strings).
         */
        this.permissionSet = {};

        /**
         * @member {Map<String,Object>} Defiant.Plugin.Account#permission
         *   A Map of permissions which can be assigned to different roles.
         */
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

        for (let existingPlugin of ['Settings', 'FormApi', 'Router', 'Orm', 'QueryApi'].map(name => this.engine.pluginRegistry.get(name))) {
          if (existingPlugin instanceof Plugin) {
            await this.notify(existingPlugin, 'enable');
          }
        }
        break; // pre:enable

      case 'enable':
        switch ((plugin || {}).id) {
          case 'Settings':
            // Declare the Permissions Data objects.
            // Declare permissions.
            plugin.cacheRegistry.set(new Data({
              id: 'account/permissionArray.json',
              filename: Path.join('account', 'permissionArray.json'),
              storage: 'settings',
              storageCanChange: true,
              description: 'This contains the permissions associated with account roles',
              default: {},
            }));
            this.permissionArray = plugin.cacheRegistry.get('account/permissionArray.json');
            await this.permissionArray.load();

            plugin.cacheRegistry.set(new Data({
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
            this.role = plugin.cacheRegistry.get('account/role.json');
            await this.role.load();
            this.parsePermissions();

            break; // Settings

          case 'FormApi':
            // Declare the Forms.
            plugin
              .setForm(new Form(this.engine, {
                id: 'LoginForm',
                Instance: require('./form/loginFormInstance'),
              }))
              .setForm(new Form(this.engine, {
                id: 'ChangePasswordForm',
                Instance: require('./form/changePasswordFormInstance'),
              }))
              .setForm(new Form(this.engine, {
                id: 'Account.PermissionForm',
                Instance: require('./form/permissionFormInstance'),
              }))
              .setForm(new Form(this.engine, {
                id: 'Account.RolesEditForm',
                Instance: require('./form/rolesEditFormInstance'),
              }));
            this.FormApi_Router_enabled();
            break; // FormApi

          case 'Router':
            // Declare the Router Handlers.
            plugin
              .addHandler(new (require('./handler/logoutHandler'))())
              .addHandler(new (require('./handler/accountLoadHandler'))())
              .addHandler(new (require('./handler/accountHandler'))())
              .addHandler(new (require('./handler/accountsHandler'))())
              .addHandler(new (require('./handler/rolesHandler'))())
              .addHandler(new (require('./handler/rolesNewHandler'))())
              .addHandler(new (require('./handler/rolesEditHandler'))());
            this.FormApi_Router_enabled();
            break; // Router

          case 'Orm':
            // Declare the Entities.
            let AccountEntity = require('./entity/accountEntity');
            plugin.entityRegistry.set(new AccountEntity(this.engine, 'account'));

            // Check to see if Accout Id 1 exists.
            let accountEntity = plugin.entityRegistry.get('account');
            let account = await accountEntity.load({id:1});
            if (!account) {
              // Create a default admin account.
              // TODO: Default the password to a UUID.
              let password = 'foo';
              account = await accountEntity.save({
                username: [{value: 'admin'}],
                password: [{value: await this.hashPassword(password)}],
              });
              console.log(`Account "admin" created, password: "${password}"`);
            }
            break; // Orm

          case 'QueryApi':
            // Declare the Queries.
            plugin.queryRegistry
              .set(new(require('./query/accountQuery'))(this.engine))
              .set(new(require('./query/accountsQuery'))(this.engine));
            break; // QueryApi
        }
        break; // enable

      case 'pre:disable':
        // @todo Cleanup entries in Settings, FormApi, Router, Orm, QueryApi.
        break; // pre:disable
    }
  }

  /**
   * Add the necessary handlers when both FormApi and Router plugins have
   * already been enabled.
   * @function
   */
  FormApi_Router_enabled() {
    const FormApi = this.engine.pluginRegistry.get('FormApi');
    const Router = this.engine.pluginRegistry.get('Router');

    if ((FormApi instanceof Plugin) && (Router instanceof Plugin)) {
      Router
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
        .addHandler(new AdminHandler({
          id: 'Account.Permissions',
          path: 'admin/permissions',
          menu: {
            menu: 'admin',
            text: 'Edit Permissions',
            description: 'Choose the permissions to associate with a user role',
          },
          renderable: FormApi.getForm('Account.PermissionForm'),
        }));
    }
  }

  /**
   * Perform a hash on a password.  Defaults to a rounds cost of 14.
   * @todo make the cost configurable.
   * @todo should this just be async?
   * @function
   * @param {String} password
   *   The password to be hashed.
   * @returns {Promise}
   *   The hashed result.
   */
  hashPassword(password) {
    // Returns a Promise from bcrypt.
    // Uses a default rounds cost of 14.
    return bcrypt.hash(password, 14);
  }

  /**
   * Compare a plaintext password against a potential hash, checking for a
   * match.
   * @todo Should this just be async?
   * @param {String} plaintextPassword
   *   The plaintext version of the password.
   * @param {String} hashedPassword
   *   The hashed password to compaire `plaintext` against.  `hashedPassword`
   *   contains the data on rounds cost, etc.
   * @returns {Promise}
   *   Whether or not they match.
   */
  comparePassword(plaintextPassword, hashedPassword) {
    // Returns a Promise from bcrypt.
    return bcrypt.compare(plaintextPassword, hashedPassword);
  }

  /**
   * Convert the arrays of permissionArray to sets.  This is necessary because
   * sets are faster for roleHasPermission(), but sets are not supported by
   * JSON, which is used by the Data object.
   * @function
   */
  parsePermissions() {
    this.permissionSet = {};
    for (let role of Object.keys(this.role.data)) {
      this.permissionSet[role] = new Set(this.permissionArray.data[role]);
    }
  }

  /**
   * Verify that the provided account has the required permission by checking
   * the roles assigned to that account and the permissions assigned to those
   * roles.
   * @function
   * @async
   * @param {Object} account
   *   The account to check.
   * @param {String} permission
   *   The permission to check.
   * @returns {Boolean}
   *   Whether or not the account has the permission.
   */
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

  /**
   * Verify that a role has been granted a specific permission.
   * @function
   * @async
   * @param {String} role
   *   The role to check.
   * @param {String} permission
   *   The permission to check.
   * @returns {Boolean}
   *   Whether or not the role has the requested permission.
   */
  async roleHasPermission(role, permission) {
    if (this.permissionSet && this.permissionSet[role]) {
      return this.permissionSet[role].has(permission);
    }
    return false;
  }
}

module.exports = Account;
