"use strict";

const sql = require('sql');
const Table = require('../table');

class Attribute extends Table{
  constructor(engine, relationship, name, alias=null) {
    super(engine, name, alias);
    this.relationship = relationship;
    return this;
  }
  
  getSchema() {
    return {
      name: this.entity.id + '_' + this.id,
      // Column types are: serial, varchar(<size>), int, 
      columns: [{
        name: 'id',
        dataType: 'serial',
      }, {
        name: 'entityId',
        dataType: 'int',
      }],
      keys: ['id', 'entityId']
    };
  }
  
  addJoin(query, joinAgainst) {
    return joinAgainst.leftJoin(this.table).on(joinAgainst.id.equals(this.table.entityId));
  }
}

module.exports = Attribute;