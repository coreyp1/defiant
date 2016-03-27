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
        Radios = fapi.getElement('Radios'),
        Select = fapi.getElement('Select'),
        Password = fapi.getElement('Password'),
        Textarea = fapi.getElement('Textarea'),
        post = context.post[this.name] || {};

    return co(function*(self, superInit) {
      // Build the form here!
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
          checkboxes: [
            {value: 'yes', label: 'Yes'},
            {value: 'no', label: 'No'},
            {value: 'maybe', label: 'Maybe'},
          ],
          description: 'Check something!',
        }))
        .addElement(new Radios('signal', {
          radios: [
            {value: 'near', label: 'Near'},
            {value: 'far', label: 'Far'},
            {value: 'neither', label: 'Neither!'},
          ],
          label: 'Where?',
          description: 'Anywhere the wind blows',
        }))
        .addElement(new Select('country', {
          attributes: {multiple: undefined},
          options: [
            {
              optgroup: "North America",
              options: [
                {value: 'US', label: "United States"},
                {value: 'CAD', label: "Canada"},
              ],
            },
            {value: 'Mex', label: "Mexico"},
          ],
          label: 'Where do you live?',
          description: 'Assuming you are alive...',
        }))
        .addElement(new Password('pass', {
          label: 'Speak friend and enter',
        }))
        .addElement(new Textarea('message', {
          label: 'Important Stuff',
          description: 'Write it here!',
          defaultValue: 'Howdy',
        }))
      // end building the form!
      return yield superInit.call(self, context);
    })(this, super.init);
  }
}

module.exports = ExampleForm;
