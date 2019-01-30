"use strict"

const BaseFormatSetUl = require('./baseFormatSetUl');

class BaseFormatSetOl extends BaseFormatSetUl {
  commit(context, subquery, formattedRows) {
    let output = '';
    for (let fr of formattedRows) {
      output += '<li class="query_row">' + this.commitRow(context, subquery, fr) + '</li>';
    }
    return `<ol class="query_row">${output}</ol>`;
  }
}

BaseFormatSetOl.id = 'ol';

module.exports = BaseFormatSetOl;
