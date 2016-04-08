'use strict';

const Form = require('../../fapi/form');
const {coroutine: co, promisify} = require('bluebird');
const Path = require('path');
const fs = require('fs');
const mkdirp = require('../../../util/mkdirp');
const fsRmdir = promisify(fs.rmdir);

class SettingsPathsForm extends Form {
  init(context) {
    let Fapi = context.engine.plugin.get('Fapi'),
        Settings = context.engine.plugin.get('Settings'),
        Text = Fapi.getElement('Text'),
        Button = Fapi.getElement('Button'),
        post = context.post[this.name] || {};

    return co(function*(self, superInit) {
      // Build the form here!
      let paths = yield Settings.cache.get('settings/locations.json').load();

      // Create the textfields, one for each path.
      Object.keys(paths).map(key => {
        let field = new Text('path-' + key, {label: paths[key].name, required: true, description: paths[key].description, defaultValue: paths[key].directory});

        // Attach a validator to the field element.
        field.validate = co(function*(context) {
          let elementName = 'path-' + key,
              testPath = post[elementName],
              e = yield mkdirp(Path.join(testPath, '__test'));
          if (e) {
            // The test directory could not be created.
            self.setError(context, 'elementName', 'Error writing to directory.');
            return;
          }
          // Cleanup.
          yield fsRmdir(Path.join(testPath, '__test'));
        });
        self.addElement(field);
      });

      self.addElement(new Button('save', {value: 'save', content: 'Save Changes'}));

      return yield superInit.call(self, context);
    })(this, super.init);
  }

  submit(context) {
    return co(function* (self) {
      let Settings = context.engine.plugin.get('Settings'),
          post = context.post[self.name] || {},
          pathsObj = Settings.cache.get('settings/locations.json'),
          paths = yield pathsObj.load(),
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

      let e = yield pathsObj.save();
      if (e) {
        // TODO: Notify user of error.
        console.log(e);
      }
    })(this);
  }
}

module.exports = SettingsPathsForm;
