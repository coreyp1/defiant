"use strict";

const Form = require('../../formApi/form');
const EntityEditFormInstance = require('./entityEditFormInstance');
const merge = require('../../../util/merge');

class EntityEditForm extends Form {
  constructor(engine, setup={}) {
    if (!setup.id) {
      throw {
        message: 'Entity edit form id missing',
        entity: setup.Entity,
      }
    }
    super(engine, merge({
      Instance: EntityEditFormInstance,
      instanceSetup: {
        data: {
          attributes: {
            class: new Set(['entity-edit', `entity-${setup.Entity.name}`]),
          },
        },
      },
    }, setup));
    ['Entity'].map(val => this[val] = setup[val] ? setup[val] : (this[val] ? this[val] : this.constructor[val]));
  }
}

module.exports = EntityEditForm;
