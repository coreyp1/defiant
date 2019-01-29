"use strict";

const Form = require('../../formApi/form');

class ExampleForm extends Form {
  constructor(buildState, ivBase) {
    super(buildState, ivBase);
    this.data.attributes = {
      class: ['foo', 'bar', 'baz'],
      id: ['yo'],
    };
  }

  async init(context) {
    let FormApi = context.engine.pluginRegistry.get('FormApi'),
        Text = FormApi.getElement('Text'),
        Button = FormApi.getElement('Button'),
        Hidden = FormApi.getElement('Hidden'),
        Encrypted = FormApi.getElement('Encrypt'),
        Static = FormApi.getElement('Static'),
        Checkboxes = FormApi.getElement('Checkboxes'),
        Radios = FormApi.getElement('Radios'),
        Select = FormApi.getElement('Select'),
        Password = FormApi.getElement('Password'),
        Textarea = FormApi.getElement('Textarea'),
        Fieldset = FormApi.getElement('Fieldset');

    // Build the form here!
    this.addElement(new Button('submit', {value: 'X', content: 'Submit'}))
      .addElement(new Text('textFoo[one]', {
        label: {content: 'Text box 1'},
        description: {content: 'Sample description.'},
        defaultValue: 'foo',
      }))
      .addElement(new Text('textFoo[two]', {
        label: {content: 'Text box 2'},
        description: {content: 'Sample description.'},
        defaultValue: 'foo',
      }))
      .addElement(new Hidden('hideMe', {value: 'asdf'}))
      .addElement(new Encrypted('imEncrypted', {value: 'foo'}))
      .addElement(new Static('imStatic', {value: 'bar', verifyIncluded: true}))
      .addElement(new Password('pass', {
        label: 'Speak friend and enter',
      }))
      .addElement(new Textarea('message', {
        label: 'Important Stuff',
        description: 'Write it here!',
        defaultValue: 'Howdy',
      }))
      .addElement(new Fieldset('stuff', {legend: 'Boring Questions',})
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
        })));
    // end building the form!
    return await super.init(context);
  }
}

module.exports = ExampleForm;
