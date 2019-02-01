"use strict";

const Entity = require('../../orm/entity');
const Text = require('../../orm/attribute/text');

class AccountEntity extends Entity {
  constructor(engine, name) {
    super(engine, name);
    this.attributeRegistry.set(new Text(engine, this, 'email'));
    this.attributeRegistry.set(new Text(engine, this, 'username'));
    this.attributeRegistry.set(new Text(engine, this, 'password'));
    return this;
  }
}

AccountEntity.path = 'account';

module.exports = AccountEntity;
