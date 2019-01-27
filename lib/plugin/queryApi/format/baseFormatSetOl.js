"use strict"

const BaseFormatSetUl = require('./baseFormatSetUl');

class BaseFormatSetOl extends BaseFormatSetUl {
  commit(subquery, formattedRows) {
    let output = '';
    for (let fr of formattedRows) {
      output += '<li class="query_row">' + this.commitRow(subquery, fr) + '</li>';
    }
    return `<ol class="query_row">${output}</ol>`;
  }
}

BaseFormatSetOl.id = 'ol';

module.exports = BaseFormatSetOl;
