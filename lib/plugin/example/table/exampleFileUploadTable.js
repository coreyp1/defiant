"use strict";

const Table = require('../../orm/table');

/**
 * Example of extending the Table class to support the file upload example.
 * @class
 * @extends Defiant.Plugin.Orm.Table
 * @extends Defiant.Plugin.Example
 */
class ExampleFileUpload extends Table {
  /**
   * Return the schema of the Table.
   *
   * Override this method to customize which columns and their associated types
   * are made part of the table.
   * @function
   * @returns {Object}
   *   A description of the table.
   */
  schema() {
    let schema = super.schema();
    schema.columns.push({
      name: 'fileId',
      dataType: 'INTEGER',
      notNull: false,
      unique: false,
    });
    schema.keys.push('fileId');
    return schema;
  }

  /**
   * Return a URL for the file in question
   * @function
   * @async
   * @param {Object} file
   *   The file object.
   * @returns {String}
   *   The url to access the file.
   */
  async getUrl(file) {
    return `/file/example/uploaded/${file.uuid}`;
  }
}

module.exports = ExampleFileUpload;
