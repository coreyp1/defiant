"use strict";

const Manager = require('./manager');

/**
 * LocalManager is a file manager for storing files on the local file system.
 * @class
 * @extends Defiant.Plugin.FileApi.Manager
 * @memberOf Defiant.Plugin.FileApi
 */
class LocalManager extends Manager {
  /**
   * Return the schema of the Table.
   * @function
   * @returns {Object}
   *   A description of the table.
   */
  schema() {
    let schema = super.schema();
    schema.columns.push({
      name: 'path', // Absolute filepath on the file system.
      dataType: 'TEXT',
      notNull: true,
      unique: false,
    });
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
  async getUrl(entity) {
    // URL in the form of:
    // entity.Manager path / entity.uuid
    return entity.managerData ? `${this.path}/${entity.uuid}` : '';
  }
}

module.exports = LocalManager;
