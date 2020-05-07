'use strict';

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const Entity = require('./entity');
const EntityEditForm = require('./form/entityEditForm');
const EntityDeleteForm = require('./form/entityDeleteForm');
const EntityEditHandler = require('./handler/entityEditHandler');
const EntityCreateHandler = require('./handler/entityCreateHandler');
const EntityDeleteHandler = require('./handler/entityDeleteHandler');
const Attribute = require('./attribute');
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
   * Process a notification that some `plugin` has performed some `action`.
   * @todo Track the additions so that the 'disable' action can be supported.
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

        // TODO: The database path should be configurable.
        this.engine.database = new sqlite3.Database('/var/defiant/sqlite.db');
        break; // pre-enable

      case 'enable':
        switch ((plugin || {}).id) {
          case 'QueryApi':
            plugin.fieldFormatRegistry
              .set(require('./format/fieldFormatUuidLink'));

            await this.registerMissingEntities();
            break; // QueryApi

          default:
            await this.registerMissingEntities();
            break; // default
        }
        break; // enable

        case 'pre:disable':
          // @todo Remove entries from QueryApi, FormApi, and Router.
          break; // pre:disable

        case 'disable':
          switch ((plugin || {}).id) {
            default:
              // @todo Unregister now missing entities
              break; // default
          }
          break; // disable
    }
  }


  /**
   * After a Plugin is enabled, this this function will register QueryApi
   * entries and Handlers for any newly defined Entities or their attributes.
   * @function
   * @async
   */
  async registerMissingEntities() {
    const FormApi = this.engine.pluginRegistry.get('FormApi');
    const Router = this.engine.pluginRegistry.get('Router');
    const QueryApi = this.engine.pluginRegistry.get('QueryApi')

    for (let entity of this.entityRegistry.getOrderedElements()) {
      if (entity instanceof Entity) {
        if (!entity.initialized) {
          // Create the Entity tables (if necessary).
          await entity.init();
        }

        if (QueryApi instanceof Plugin) {
          // Register the entities and their attributes with QueryApi.
          let BaseRegistry = QueryApi.baseRegistry;

          if (!BaseRegistry.get(entity.id)) {
            BaseRegistry.set(entity.getQueryBase());
          }

          for (let attribute of entity.attributeRegistry.getOrderedElements()) {
            if (attribute instanceof Attribute) {
              let base = attribute.getQueryBase();
              if (!BaseRegistry.get(base.id)) {
                BaseRegistry.set(base);
              }
            }
          }
        }

        if (FormApi instanceof Plugin) {
          // Register the Forms with FormApi.
          const editFormId = `Entity.${entity.name}.edit`;
          if (!FormApi.formRegistry.get(editFormId)) {
            FormApi.setForm(new EntityEditForm(this.engine, {
              id: editFormId,
              Entity: entity,
            }));
          }

          const deleteFormId = `Entity.${entity.name}.delete`;
          if (!FormApi.formRegistry.get(deleteFormId)) {
            FormApi.setForm(new EntityDeleteForm(this.engine, {
              id: deleteFormId,
              Entity: entity,
            }));
          }

          // The Router Items cannot be added until the forms have been created.
          if (Router instanceof Plugin) {
            // Register the Handlers with Router.
            const editHandlerId = `EntityEditFormHandler.${entity.name}`;
            if (!Router.handlerRegistry.get(editHandlerId)) {
              Router.addHandler(new EntityEditHandler({
                id: editHandlerId,
                path: `${entity.id}/*/edit`,
                form: editFormId,
              }));
            }

            const createHandlerId = `EntityCreateFormHandler.${entity.name}`;
            if (!Router.handlerRegistry.get(editHandlerId)) {
              Router.addHandler(new EntityCreateHandler({
                id: createHandlerId,
                path: `${entity.id}/new`,
                form: editFormId,
              }));
            }

            const deleteHandlerId = `EntityDeleteHandler.${entity.name}`;
            if (!Router.handlerRegistry.get(editHandlerId)) {
              Router.addHandler(new EntityDeleteHandler({
                id: deleteHandlerId,
                path: `${entity.id}/*/delete`,
                form: deleteFormId,
              }));
            }
          }
        }

        // TODO:
        // Register the display query with QueryApi.
        // Register the display query Handler with Router.
      }
    }
  }
}

module.exports = Orm;
