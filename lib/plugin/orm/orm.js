'use strict';

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const EntityEditForm = require('./form/entityEditForm');
const EntityDeleteForm = require('./form/entityDeleteForm');
const EntityEditHandler = require('./handler/entityEditHandler');
const EntityCreateHandler = require('./handler/entityCreateHandler');
const EntityDeleteHandler = require('./handler/entityDeleteHandler');
const sqlite3 = require('sqlite3');

/**
 * The ORM plugin provides an abstraction layer between the app and the database
 * store.  A [Table]{@link Defiant.Plugin.Orm.Table} object represents a table
 * in the Database and is the basis for storage.
 *
 * An [Entity]{@link Defiant.Plugin.Orm.Entity} is a logical collection of
 * [Attributes]{@link Defiant.Plugin.Orm.Attribute}, which themselves may be
 * based on additional tables.
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Plugin
 */
class Orm extends Plugin {
  /**
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @returns {Defiant.Plugin.Orm}
   *   The instantiated ORM plugin.
   */
  constructor(engine) {
    super(engine);

    /**
     * @member {Defiant.util.Registry} Defiant.Plugin.Orm#entityRegistry
     *   A registry of [Entities]{@link Defiant.Plugin.Orm.Entity}.
     */
    this.entityRegistry = new Registry();

    /**
     * @todo Make the database configurable.
     * @member {Object} Defiant.Engine#database
     *   The database to use.
     */
    this.engine.database = null;

    let fieldFormatRegistry = this.engine.pluginRegistry.get('QueryApi').fieldFormatRegistry;
    fieldFormatRegistry
      .set(require('./format/fieldFormatUuidLink'));

    return this;
  }

  /**
   * All plugins will be initialized in order of their weight by
   * {@link Defiant.Engine#init}.
   * @function
   * @async
   */
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

      // Register the Forms with FormApi.
      const editFormId = `Entity.${entity.name}.edit`;
      FormApi.setForm(new EntityEditForm(this.engine, {
        id: editFormId,
        Entity: entity,
      }));

      const deleteFormId = `Entity.${entity.name}.delete`;
      FormApi.setForm(new EntityDeleteForm(this.engine, {
        id: deleteFormId,
        Entity: entity,
      }));

      // Register the Handlers with Router.
      Router.addHandler(new EntityEditHandler({
        id: `EntityEditFormHandler.${entity.name}`,
        path: `${entity.id}/*/edit`,
        form: editFormId,
      }));

      Router.addHandler(new EntityCreateHandler({
        id: `EntityCreateFormHandler.${entity.name}`,
        path: `${entity.id}/new`,
        form: editFormId,
      }));

      Router.addHandler(new EntityDeleteHandler({
        id: `EntityDeleteHandler.${entity.name}`,
        path: `${entity.id}/*/delete`,
        form: deleteFormId,
      }));

      // Register the display query with QueryApi.

      // Register the display query Handler with Router.
    }
  }
}

module.exports = Orm;
