'use strict';

const Form = require('../../formApi/form');
const Path = require('path');
const fs = require('fs');
const mkdirp = require('../../../util/mkdirp');

class SettingsPathsForm extends Form {
  async init(context) {
    let FormApi = context.engine.pluginRegistry.get('FormApi'),
        Settings = context.engine.pluginRegistry.get('Settings'),
        Text = FormApi.getElement('Text'),
        Button = FormApi.getElement('Button'),
        post = context.post[this.name] || {};

    // Build the form here!
    let paths = await Settings.cacheRegistry.get('settings/locations.json').load();

    // Create the textfields, one for each path.
    Object.keys(paths).map(async(key) => {
      let field = new Text('path-' + key, {label: paths[key].name, required: true, description: paths[key].description, defaultValue: paths[key].directory});

      // Attach a validator to the field element.
      field.validate = async(context) => {
        let elementName = 'path-' + key,
            testPath = post[elementName],
            e = await mkdirp(Path.join(testPath, '__test'));
        if (e) {
          // The test directory could not be created.
          this.setError(context, 'elementName', 'Error writing to directory.');
          return;
        }
        // Cleanup.
        await fs.promises.rmdir(Path.join(testPath, '__test'));
      };
      this.addElement(field);
    });

    this.addElement(new Button('save', {value: 'save', content: 'Save Changes'}));

    return super.init(context);
  }

  async submit(context) {
    let Settings = context.engine.pluginRegistry.get('Settings'),
        post = context.post[this.name] || {},
        pathsObj = Settings.cacheRegistry.get('settings/locations.json'),
        paths = await pathsObj.load(),
        changed = false;

    // Update the Data object if the directory has been changed.
    Object.keys(paths).map(key => {
      let elementName = 'path-' + key;
      if (post[elementName] && (post[elementName] !== paths[key].directory)) {
        pathsObj.data[key].directory = post[elementName];
        changed = true;
      }
    });

    if (!changed) {
      return;
    }

    let e = await pathsObj.save();
    if (e) {
      // TODO: Notify user of error.
      console.log(e);
    }
  }
}

module.exports = SettingsPathsForm;
