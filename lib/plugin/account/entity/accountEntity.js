"use strict";

const Entity = require('../../orm/entity');
const Text = require('../../orm/attribute/text');

class AccountEntity extends Entity {
  constructor(engine, name, data={}) {
    super(engine, name, data);
    this.attributeRegistry.set(new Text(engine, this, 'email', {
      count: 1,
      label: 'Email',
    }));
    this.attributeRegistry.set(new Text(engine, this, 'username', {
      count: 1,
      label: 'Username',
    }));
    this.attributeRegistry.set(new Text(engine, this, 'password', {
      count: 1,
      label: 'Password',
      query: 'omit',
    }));
    return this;
  }
}

AccountEntity.path = 'account';

module.exports = AccountEntity;
