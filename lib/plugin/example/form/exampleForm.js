"use strict";

const Form = require('../../fapi/form');
const {coroutine: co} = require('bluebird');

class ExampleForm extends Form {
  init(context) {
    let fapi = context.engine.plugin.get('Fapi'),
        Text = fapi.getElement('Text'),
        Button = fapi.getElement('Button'),
        Hidden = fapi.getElement('Hidden'),
        Encrypted = fapi.getElement('Encrypt'),
        Static = fapi.getElement('Static'),
        Checkboxes = fapi.getElement('Checkboxes'),
        Radio = fapi.getElement('Radio'),
        post = context.post[this.name] || {};

    return co(function*(self, superInit) {
      // build the form here!
      self.addElement(new Button('submit', {value: 'X', content: 'Submit'}))
        .addElement(new Text('textFoo', {
          label: {content: 'This'},
          description: {content: 'Sample description.'},
          defaultValue: 'foo',
        }))
        .addElement(new Hidden('hideMe', {value: 'asdf'}))
        .addElement(new Encrypted('imEncrypted', {value: 'foo'}))
        .addElement(new Static('imStatic', {value: 'bar', verifyIncluded: true}))
        .addElement(new Checkboxes('checky', {
          checkboxes: {
            yes: 'Yes',
            no: 'No',
            maybe: 'Maybe',
          },
          description: 'Check something!',
        }))
        .addElement(new Radio('signal', {
          radios: {
            near: 'Near',
            far: 'Far',
            neither: 'Neither!',
          },
          label: 'Where?',
          description: 'Anywhere the wind blows',
        }))
      // end building the form!
      return yield superInit.call(self, context);
    })(this, super.init);
  }
}

module.exports = ExampleForm;
