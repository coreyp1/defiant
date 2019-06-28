"use strict";

const FormInstance = require('../../formApi/formInstance');

class ExampleFormInstance extends FormInstance {
  async init() {
    let FormApi = this.context.engine.pluginRegistry.get('FormApi'),
        Text = FormApi.getElement('Text'),
        Button = FormApi.getElement('Button'),
        Hidden = FormApi.getElement('Hidden'),
        Encrypted = FormApi.getElement('Encrypt'),
        Static = FormApi.getElement('Static'),
        Checkbox = FormApi.getElement('Checkbox'),
        Checkboxes = FormApi.getElement('Checkboxes'),
        Radios = FormApi.getElement('Radios'),
        Select = FormApi.getElement('Select'),
        Password = FormApi.getElement('Password'),
        Textarea = FormApi.getElement('Textarea'),
        Fieldset = FormApi.getElement('Fieldset');

    // Build the form here!
    this
      .addInstance(Checkbox.newInstance(this.context, {
        name: 'singleCheckbox',
        data: {
          label: 'This form doesn\'t make any sense',
          checkboxLabel: 'I agree',
          description: 'This checkbox defaults to being checked',
          value: 'nonsense',
          defaultChecked: true,
        },
      }))
      .addInstance(Button.newInstance(this.context, {
        name: 'submit',
        data: {
          value: 'X',
          content: 'Submit',
        },
      }))
      .addInstance(Text.newInstance(this.context, {
        name: 'textFoo[one]',
        data: {
          label: 'Text box 1',
          description: 'Sample description.',
          defaultValue: 'foo',
        },
      }))
      .addInstance(Text.newInstance(this.context, {
        name: 'textFoo[two]',
        data: {
          label: 'Text box 2',
          description: 'Sample description.',
          defaultValue: 'foo',
        },
      }))
      .addInstance(Hidden.newInstance(this.context, {
        name: 'hideMe',
        data: {
          value: 'asdf',
        },
      }))
      .addInstance(Encrypted.newInstance(this.context, {
        name: 'imEncrypted',
        data: {
          value: 'foo',
        },
      }))
      .addInstance(Static.newInstance(this.context, {
        name: 'imStatic',
        data: {
          value: 'bar',
          verifyIncluded: true,
        },
      }))
      .addInstance(Password.newInstance(this.context, {
        name: 'pass',
        data: {
          label: 'Speak friend and enter',
        },
      }))
      .addInstance(Textarea.newInstance(this.context, {
        name: 'message',
        data: {
          label: 'Important Stuff',
          description: 'Write it here!',
          defaultValue: 'Howdy',
        },
      }))
      .addInstance(Fieldset.newInstance(this.context, {
        name: 'stuff',
        data: {
          legend: 'Boring Questions',
        },
      }).addInstance(Select.newInstance(this.context, {
          name: 'country',
          data: {
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
          },
        }))
        .addInstance(Checkboxes.newInstance(this.context, {
          name: 'checky',
          data: {
            checkboxes: [
              {value: 'yes', label: 'Yes'},
              {value: 'no', label: 'No', defaultChecked: true},
              {value: 'maybe', label: 'Maybe'},
            ],
            description: 'Check something!',
          },
        }))
        .addInstance(Radios.newInstance(this.context, {
          name: 'signal',
          data: {
            radios: [
              {value: 'near', label: 'Near'},
              {value: 'far', label: 'Far'},
              {value: 'neither', label: 'Neither!'},
            ],
            defaultValue: 'neither',
            label: 'Where?',
            description: 'Anywhere the wind blows',
          },
        })));
    // end building the form!
    await super.init();
  }
}

module.exports = ExampleFormInstance;
