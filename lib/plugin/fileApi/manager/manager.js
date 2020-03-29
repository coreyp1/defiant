"use strict";

const Table = require('../../orm/table');

/**
 * The Manager class maps which
 * @class
 * @extends Defiant.Plugin.Orm.Table
 * @memberOf Defiant.Plugin.FileApi
 */
class Manager extends Table {
  /**
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @param {String} name
   *   The name of the file manager.
   * @param {Object} options
   *   Options for the file manager.
   * @returns {Defiant.Plugin.FileApi.Manager}
   *   The instantiated Manager object.
   */
  constructor(engine, name, options) {
    super(engine, name);
    this.options = options;
  }

  /**
   * Return the schema of the Table.
   * @function
   * @returns {Object}
   *   A description of the table.
   */
  schema() {
    let schema = super.schema();
    schema.columns.push({
      name: 'fileId',
      dataType: 'INTEGER',
      notNull: true,
      unique: false, // Not 'true' to avoid autoincrement connotation.
    });
    schema.keys.push('fileId');
    return schema;
  }

  /**
   * Provide a URL to this file.
   * @function
   * @async
   * @param {Defiant.Plugin.Orm.Entity} entity
   *   The Entity whose url should be retrieved.
   * @returns {String}
   *   A URL to the file.
   */
  getUrl(entity) {
    return entity.tempPath;
  }

  /**
   * Save the File record in the Manager table.
   * @function
   * @async
   * @param {Object} entity
   *   The File to be saved.
   */
  async save(entity) {
    entity.managerData = entity.managerData || {};
    await super.save(entity.managerData);
  }

  /**
   * Load a single file record from the Manager.
   * @function
   * @async
   * @param {Defiant.Plugin.Orm.Entity} entity
   *   The File Entity to be loaded.
   * @returns {Defiant.Plugin.Orm.Entity}
   *   The loaded Entity.
   */
  async load(entity) {
    entity.managerData = {
      fileId: entity.id,
      manager: this.name,
    };
    await super.load(entity.managerData);
  }

  /**
   * Purge a single file record from the Manager table.
   * @function
   * @async
   * @param {number|Map<String,String|number>} condition
   *   Either the id of the file to delete or a key/value pair representing the
   *   condition to be matched.
   */
  async purge(condition) {
    condition = Number.isInteger(condition) ? {id: condition} : condition;
    await super.purge(condition);
  }
}

module.exports = Manager;
