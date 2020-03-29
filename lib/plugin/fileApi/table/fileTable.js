"use strict";

const Table = require('../../orm/table');
const uuid = require('node-uuid');

/**
 * A Table to track the files uploaded to the app.
 * @class
 * @extends Defiant.Plugin.Orm.Table
 * @memberOf Defiant.Plugin.FileApi
 */
class FileEntity extends Table {
  /**
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @param {String} name
   *   The name of the table.
   * @param {Object} options
   *   Options for the file table.
   * @returns {Defiant.Plugin.FileApi.FileEntity}
   *   The instantiated FileEntity object.
   */
  constructor(engine, name, options) {
    super(engine, name);
    this.options = options;
    return this;
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
      name: 'uuid',
      dataType: 'VARCHAR(36)',
      notNull: true,
      unique: true,
    }, {
      name: 'type',
      dataType: 'TEXT',
      notNull: false,
      unique: false,
    }, {
      name: 'created',
      dataType: 'INTEGER',
      notNull: true,
      unique: false,
    }, {
      name: 'accountId',
      dataType: 'INTEGER',
      notNull: false,
      unique: false,
    }, {
      name: 'size',
      dataType: 'INTEGER',
      notNull: false,
      unique: false,
    }, {
      name: 'originalName',
      dataType: 'TEXT',
      notNull: false,
      unique: false,
    }, {
      name: 'usageCount',
      dataType: 'INTEGER',
      notNull: true,
      unique: false,
    }, {
      name: 'path',
      dataType: 'TEXT',
      notNull: true,
      unique: false,
    });
    schema.keys.push('uuid', 'accountId', 'type');
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
    if (entity.type) {
      let Orm = this.engine.pluginRegistry.get('Orm');
      let type = Orm.entityRegistry.get(entity.type);
      return (type && type.getUrl) ? type.getUrl(entity) : Promise.resolve('');
    }
  }

  /**
   * Prepare an entity (row in the database) to be written, making sure that
   * necessary fields are populated properly.
   * @function
   * @async
   * @param {Object} [entity={}]
   *   The entity (row) to be written.
   */
  async prepare(entity) {
    await super.prepare(entity);
    entity.uuid = entity.uuid || uuid.v4();
    entity.revisionId = entity.revisionId || null;
    entity.created = entity.created ? entity.created : Date.now();
  }

  /**
   * Purge a single row from the Table.
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

module.exports = FileEntity;
