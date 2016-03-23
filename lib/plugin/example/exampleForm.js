"use strict";

const Form = require('../fapi/form');
const {coroutine: co} = require('bluebird');

class ExampleForm extends Form {
  init(context, data) {
    let superInit = super.init,
        self = this,
        fapi = context.engine.plugin.get('Fapi'),
        Button = fapi.getElement('Button');
    return co(function*() {
      // build the form here!
      self.addElement(new Button('Submit'));
      // end building the form!
      return yield superInit.call(self, context);
    })();
  }
}

module.exports = ExampleForm;
