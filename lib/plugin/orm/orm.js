'use strict';

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const EntityEditForm = require('./form/entityEditForm');
const EntityEditHandler = require('./handler/entityEditHandler');
const sqlite3 = require('sqlite3');

class Orm extends Plugin {
  constructor(engine) {
    super(engine);
    this.entityRegistry = new Registry();
    this.engine.database = null;

    let fieldFormatRegistry = this.engine.pluginRegistry.get('QueryApi').fieldFormatRegistry;
    fieldFormatRegistry
      .set(require('./format/fieldFormatUuidLink'));

    return this;
  }

  async init() {
    const FormApi = this.engine.pluginRegistry.get('FormApi');
    const Router = this.engine.pluginRegistry.get('Router');

    // TODO: The database path should be configurable.
    this.engine.database = new sqlite3.Database('/var/defiant/sqlite.db');

    let BaseRegistry = this.engine.pluginRegistry.get('QueryApi').baseRegistry;
    for (let entity of this.entityRegistry.getOrderedElements()) {
      // Create the Entity tables (if necessary).
      await entity.createTable();

      // Register the entities and their attributes with QueryApi.
      if (typeof entity.getQueryBase === 'function') {
        BaseRegistry.set(entity.getQueryBase());
        for (let attribute of entity.attributeRegistry.getOrderedElements()) {
          if (typeof attribute.getQueryBase === 'function') {
            BaseRegistry.set(attribute.getQueryBase());
          }
        }
      }

      // Register the edit form with FormApi.
      const editFormId = `Entity.${entity.name}`;
      FormApi.setForm(new EntityEditForm(this.engine, {
        id: editFormId,
        Entity: entity,
      }));

      // Register the edit form Handler with Router.
      Router.addHandler(new EntityEditHandler({
        id: `EntityEditFormHandler.${entity.name}`,
        path: `${entity.id}/*/edit`,
        form: editFormId,
      }));

      // Register the delete form.

      // Register the delete form Handler with Router.

      // Register the display query with QueryApi.

      // Register the display query Handler with Router.
    }
  }
}

module.exports = Orm;
