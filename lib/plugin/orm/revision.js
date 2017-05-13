"use strict";

const Table = require('./table');

class Revision extends Table {
  constructor(engine, relationship, name='revision', alias=null) {
    super(engine, relationship.name + '__' + name, alias);
    this.id = name;
    this.relationship = relationship;
    return this;
  }

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
