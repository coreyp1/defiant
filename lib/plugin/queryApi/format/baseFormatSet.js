"use strict"

class BaseFormatSet {
  constructor(engine) {
    this.engine = engine;
    ['id'].map(val => this[val] = this.constructor[val]);
  }

  commitRow(context, subquery, row) {
    let QueryApi = this.engine.pluginRegistry.get('QueryApi');
    const BaseFormatterSingle = QueryApi.baseFormatSingleRegistry.get(subquery.format.single.type || 'inline');
    return BaseFormatterSingle.commit(context, subquery, row);
  }

  commit(context, subquery, formattedRows) {
    let output = '';
    for (let fr of formattedRows) {
      output += this.commitRow(context, subquery, fr);
    }
    return `<div class="query_set">${output}</div>`;
  }
}

BaseFormatSet.id = 'inline';

module.exports = BaseFormatSet;
