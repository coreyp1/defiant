"use strict";

const Table = require('./table');

/**
 * A Revision table is used by the [Entity]{@link Defiant.Plugin.Orm.Entity}
 * table to keep track of when revisions to the entity are saved.
 */
class Revision extends Table {
  /**
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @param {Defiant.Plugin.Orm.Entity} relationship
   *   The Entity table that this Revision table is associated with.
   * @param {String} [name="revision"]
   *   The name to be appended to the `relationship` Table's name.
   * @returns {Defiant.Plugin.Orm.Revision}
   *   The instantiated Revision object.
   */
  constructor(engine, relationship, name='revision') {
    super(engine, relationship.name + '__' + name);
    this.id = name;

    /**
     * @member {Defiant.Plugin.Orm.Entity} Defiant.Plugin.Orm.Revision#relationship
     *   The Entity table that this Revision table is associated with.
     */
    this.relationship = relationship;
    return this;
  }

  /**
   * Returns the schema of the table.
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
      name: 'entityId',
      dataType: 'INTEGER',
      // NOTE: Ideally, this field should be notNull.  Unfortunately, we need
      // to procure the revisionId *before* we know the entityId (when saving
      // a new entity).  Therefore, we must allow for null values.
      notNull: false,
    }, {
      name: 'date',
      dataType: 'INTEGER',
      notNull: true,
    });
    schema.keys.push('entityId');
    return schema;
  }
}

module.exports = Revision;
