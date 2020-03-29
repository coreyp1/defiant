"use strict";

const Form = require('../../formApi/form');
const EntityEditFormInstance = require('./entityEditFormInstance');
const merge = require('../../../util/merge');

/**
 * Declare a form type for editing an individual Entity type.
 * @class
 * @extends Defiant.Plugin.FormApi.Form
 * @memberOf Defiant.Plugin.Orm
 */
class EntityEditForm extends Form {
  /**
   * For more options available in `setup`, see
   * [Form]{@link Defiant.Plugin.FormApi.Form}.
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @param {Object} [setup={}]
   *   The setup options.
   * @param {String} setup.id
   *   The id of the Entity Edit Form being created.
   * @param {Defiant.Plugin.Orm.Entity} setup.Entity
   *   The Entity that this form is intended for.
   * @returns {Defiant.Plugin.Orm.EntityEditForm}
   *   The instantiated EntityEditForm.
   */
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
    [
      /**
       * @member {Defiant.Plugin.Orm.Entity} Defiant.Plugin.EntityEditForm#Entity
       *   The Entity type that this form will edit.
       */
      'Entity',
    ].map(val => this[val] = setup[val] ? setup[val] : (this[val] ? this[val] : this.constructor[val]));
  }
}

module.exports = EntityEditForm;
