"use strict";

const Form = require('../../formApi/form');
const EntityDeleteFormInstance = require('./entityDeleteFormInstance');
const merge = require('../../../util/merge');

class EntityDeleteForm extends Form {
  constructor(engine, setup={}) {
    if (!setup.id) {
      throw {
        message: 'Entity delete form id missing',
        entity: setup.Entity,
      }
    }
    super(engine, merge({
      Instance: EntityDeleteFormInstance,
      instanceSetup: {
        data: {
          attributes: {
            class: new Set(['entity-delete', `entity-${setup.Entity.name}`]),
          },
        },
      },
    }, setup));
    ['Entity'].map(val => this[val] = setup[val] ? setup[val] : (this[val] ? this[val] : this.constructor[val]));
  }
}

module.exports = EntityDeleteForm;
