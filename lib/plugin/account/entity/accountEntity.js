"use strict";

const Entity = require('../../orm/entity');
const Text = require('../../orm/attribute/text');
const Role = require('../orm/role');

/**
 * The Account entity represents a user account in the Defiant Framework.
 * @class
 * @extends Defiant.Plugin.Orm.Entity
 * @memberOf Defiant.Plugin.Account
 */
class AccountEntity extends Entity {
  /**
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @param {String} name
   *   The name of the Entity.
   * @param {Map<String,Mixed>} [data={}]
   *   The setup data for this particular Entity type.
   * @returns {Defiant.Plugin.Account.AccountEntity}
   *   The instantiated AccountEntity object.
   */
  constructor(engine, name, data={}) {
    super(engine, name, data);
    this.attributeRegistry.set(new Text(engine, this, 'email', {
      count: 1,
      label: 'Email',
      form: 'omit',
    }));
    this.attributeRegistry.set(new Text(engine, this, 'username', {
      count: 1,
      label: 'Username',
      form: 'omit',
      title: true,
    }));
    this.attributeRegistry.set(new Text(engine, this, 'password', {
      count: 1,
      label: 'Password',
      query: 'omit',
      form: 'omit',
    }));
    this.attributeRegistry.set(new Role(engine, this, 'role', {
      label: 'Role',
      query: 'omit',
    }));
    return this;
  }
}

AccountEntity.path = 'account';

module.exports = AccountEntity;
