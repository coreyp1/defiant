"use strict";

const Form = require('../fapi/form');
const {coroutine: co} = require('bluebird');

class ExampleForm extends Form {
  init(context, data) {
    let superInit = super.init,
        self = this;
    return co(function*() {
      // build the form here!
      // end building the form!
      return yield superInit.call(self, context, data)
    })();
  }
}

module.exports = ExampleForm;
