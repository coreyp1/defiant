"use strict";

const sql = require('sql');

class Attribute {
  constructor(entity, id, relationship) {
    this.entity = entity;
    this.id = id;
    this.table = sql.define(this.getSchema());
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
  
  getFields() {
    let fields = [];
    for (let column in this.getSchema().columns) {
      fields.append(this.table[column.name]);
    }
    return fields;
  }

  addJoin(query, joinAgainst) {
    return joinAgainst.leftJoin(this.table).on(joinAgainst.id.equals(this.table.entityId));
  }
}

module.exports = Attribute;