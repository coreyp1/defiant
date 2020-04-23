"use strict";

/**
 * The Base is a [Table]{@link Defiant.Plugin.Orm.Table} from which a Query can
 * be built.
 * @class
 * @memberOf Defiant.Plugin.QueryApi
 */
class Base {
  /**
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @param {Object} data
   *   The setup data.
   * @returns {Defiant.Plugin.QueryApi.Base}
   *   The instantiated Base object.
   */
  constructor(engine, data={}) {
    /**
     * @member {Defiant.Engine} Defiant.Plugin.QueryApi.Base#engine
     *   The app engine.
     */
    this.engine = engine;

    /**
     * @member {Object} Defiant.Plugin.QueryApi.Base#data
     *   The setup data.
     */
    this.data = data;

    [
      /**
       * @member {String} Defiant.Plugin.QueryApi.Base#id
       *   A unique id for this base.
       */
      'id',
    ].map(key => this[key] = data[key] ? data[key] : this.constructor[key]);
  }

  /**
   * Return the [Table]{@link Defiant.Plugin.Orm.Table} schema of this Base.
   * @function
   * @returns {Object}
   *   The associated Table schema.
   */
  getTable() {
    let Orm = this.engine.pluginRegistry.get('Orm');
    let Table = Orm.entityRegistry.get(this.id);
    return this.engine.sql.define(Table.schema());
  }
}

Base.id = '';
module.exports = Base;
