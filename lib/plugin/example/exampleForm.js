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
        Static = fapi.getElement('Static'),
        Checkboxes = fapi.getElement('Checkboxes'),
        post = context.post[this.name] || {};

    return co(function*() {
      // build the form here!
      self.addElement(new Button('submit'))
        .addElement(new Text('textFoo'))
        .addElement(new Hidden('hideMe'))
        .addElement(new Encrypted('imEncrypted'))
        .addElement(new Static('imStatic'))
        .addElement(new Checkboxes('checky'))
      // end building the form!
      return yield superInit.call(self, context, {
        submit: {value: 'X', content: 'Submit'},
        textFoo: {
          label: {
            content: 'This',
          },
          description: {
            content: 'Sample description.',
          },
          defaultValue: 'foo',
        },
        hideMe: {value: 'asdf'},
        imEncrypted: {value: 'foo'},
        imStatic: {value: 'bar', verifyIncluded: true},
        checky: {
          checkboxes: {
            yes: 'Yes',
            no: 'No',
            maybe: 'Maybe',
          },
          description: 'Check something!',
        },
      });
    })();
  }
}

module.exports = ExampleForm;
