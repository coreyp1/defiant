"use strict";

const Table = require('../../orm/table');

class Manager extends Table {
  constructor(engine, name, options) {
    super(engine, name);
    this.options = options;
  }

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

  getUrl(entity) {
    return entity.tempPath;
  }

  async save(entity) {
    entity.managerData = entity.managerData || {};
    await super.save(entity.managerData);
  }

  async load(entity) {
    entity.managerData = {
      fileId: entity.id,
      manager: this.name,
    };
    await super.load(entity.managerData);
  }

  async purge(condition) {
    condition = Number.isInteger(condition) ? {id: condition} : condition;
    await super.purge(condition);
  }
}

module.exports = Manager;
