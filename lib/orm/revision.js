"use strict";

const Table = require('./table');

class Revision extends Table {
  constructor(engine, relationship, name='revision', alias=null) {
    super(engine, relationship.name + '_' + name, alias);
    this.id = name;
    this.relationship = relationship;
    return this;
  }

  schema() {
    let schema = super.schema();
    schema.columns.push({
      name: 'entityId',
      dataType: 'INTEGER',
      notNull: true,
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
