"use strict";

const Form = require('../fapi/form');
const {coroutine: co} = require('bluebird');

class ExampleForm extends Form {
  init(context, data) {
    let superInit = super.init,
        self = this,
        fapi = context.engine.plugin.get('Fapi'),
        Text = fapi.getElement('Text'),
        Button = fapi.getElement('Button'),
        Hidden = fapi.getElement('Hidden'),
        Encrypted = fapi.getElement('Encrypt'),
        Static = fapi.getElement('Static')
    return co(function*() {
      // build the form here!
      self.addElement(new Button('Submit'))
        .addElement(new Text('textFoo'))
        .addElement(new Hidden('hideMe'))
        .addElement(new Encrypted('imEncrypted'))
        .addElement(new Static('imStatic'))
      // end building the form!
      return yield superInit.call(self, context, {
        textFoo: {
          label: {
            content: 'This',
          },
          description: {
            content: 'Sample description.',
          },
        },
        hideMe: {value: 'asdf'},
        imEncrypted: {value: 'foo'},
        imStatic: {value: 'bar'},
      });
    })();
  }
}

module.exports = ExampleForm;
