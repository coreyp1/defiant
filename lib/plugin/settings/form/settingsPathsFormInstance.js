'use strict';

const FormInstance = require('../../formApi/formInstance');
const Path = require('path');
const fs = require('fs');
const mkdirp = require('../../../util/mkdirp');

/**
 * This form provides a UI for setting and overriding the paths associated with
 * the various `settings` classes.
 * @class
 * @extends FormInstance
 * @memberOf Defiant.Plugin.Settings
 */
class SettingsPathsFormInstance extends FormInstance {
  /**
   * In all FormInstance derivatives, super.init() should be called LAST!
   * Otherwise, the [Static]{@link Defiant.Plugin.FormApi.Static} and
   * [Encrypt]{@link Defiant.Plugin.FormApi.Encrypt} elements will not work
   * properly.
   *
   * When this function is finished, then the form should be ready to
   * be rendered as a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
  async init(data={}) {
    let FormApi = this.context.engine.pluginRegistry.get('FormApi'),
        Settings = this.context.engine.pluginRegistry.get('Settings'),
        Text = FormApi.getElement('Text'),
        Button = FormApi.getElement('Button'),
        post = this.context.post[this.id] || {};

    // Build the form here!
    let paths = await Settings.cacheRegistry.get('settings/locations.json').load();

    // Create the textfields, one for each path.
    Object.keys(paths).map(async(key) => {
      let field = Text.newInstance(this.context, {
        name: `path-${key}`,
        data: {
          label: paths[key].name,
          required: true,
          description: paths[key].description,
          defaultValue: paths[key].directory,
        },
      });

      // Attach a validator to the field element.
      let validateFunction = async() => {
        let elementName = 'path-' + key,
            testPath = post[elementName],
            e = await mkdirp(Path.join(testPath, '__test'));
        if (e) {
          // The test directory could not be created.
          this.setError('elementName', 'Error writing to directory.');
          return;
        }
        // Cleanup.
        await fs.promises.rmdir(Path.join(testPath, '__test'));
      };
      validateFunction.id = 'TestSettingsPathWritable';
      field.validateRegistry.set(validateFunction);
      this.addInstance(field);
    });

    this.addInstance(Button.newInstance(this.context, {
      name: 'save',
      data: {
        value: 'save',
        content: 'Save Changes',
      },
    }));

    await super.init(data);
  }

  /**
   * Perform the form submission.
   * @todo Add submissions from other plugins.
   * @function
   * @async
   */
  async submit() {
    let Settings = this.context.engine.pluginRegistry.get('Settings'),
        post = this.context.post[this.id] || {},
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

module.exports = SettingsPathsFormInstance;
