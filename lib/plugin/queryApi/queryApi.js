"use strict";

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const FormatRegistry = require('./formatRegistry');

class QueryApi extends Plugin {
  constructor(engine) {
    super(engine);

    // The baseRegistry are the possible base tables for a query.
    this.baseRegistry = new Registry();

    // The baseFormatRegistry defines how rows should be displayed as a group.
    // Examples include 'inline' and 'table'.
    this.baseFormatRegistry = new FormatRegistry(this.engine)
      .set(require('./format/baseFormatSet'))
      .set(require('./format/baseFormatSetUl'))
      .set(require('./format/baseFormatSetOl'))
      .set(require('./format/baseFormatSetCsv'))
      .set(require('./format/baseFormatSetTable'));

    // The baseFormatSingleRegistry defines how a single row should be displayed
    // within the parent baseFormatRegistry choice.
    // Examples include 'inline', 'table', and 'tableRow'.
    this.baseFormatSingleRegistry = new FormatRegistry(this.engine)
      .set(require('./format/baseFormatSingle'))
      .set(require('./format/baseFormatSingleUl'))
      .set(require('./format/baseFormatSingleOl'))
      .set(require('./format/baseFormatSingleCsv'))
      .set(require('./format/baseFormatSingleCsvRow'))
      .set(require('./format/baseFormatSingleTable'))
      .set(require('./format/baseFormatSingleTableRow'));

    // The fieldFormatRegistry defines how a single field should be formatted
    // as output.
    // Examples include "text" and "raw".
    this.fieldFormatRegistry = new FormatRegistry()
      .set(require('./format/fieldFormat'))
      .set(require('./format/fieldFormatRaw'));

    // The queryRegistry contains initialized Query objects.
    this.queryRegistry = new Registry();
  }
}

module.exports = QueryApi;
