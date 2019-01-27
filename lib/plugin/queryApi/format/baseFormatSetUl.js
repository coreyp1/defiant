"use strict"

const BaseFormatSet = require('./baseFormatSet');

class BaseFormatSetUl extends BaseFormatSet {
  commit(subquery, formattedRows) {
    let output = '';
    for (let fr of formattedRows) {
      output += '<li class="query_row">' + this.commitRow(subquery, fr) + '</li>';
    }
    return `<ul class="query_set">${output}</ul>`;
  }
}

BaseFormatSetUl.id = 'ul';

module.exports = BaseFormatSetUl;
