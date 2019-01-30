"use strict"

const BaseFormatSet = require('./baseFormatSet');

class BaseFormatSetUl extends BaseFormatSet {
  commit(context, subquery, formattedRows) {
    let output = '';
    for (let fr of formattedRows) {
      output += '<li class="query_row">' + this.commitRow(context, subquery, fr) + '</li>';
    }
    return `<ul class="query_set">${output}</ul>`;
  }
}

BaseFormatSetUl.id = 'ul';

module.exports = BaseFormatSetUl;
