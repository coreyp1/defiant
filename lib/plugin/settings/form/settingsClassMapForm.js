'use strict';

const Form = require('../../formApi/form');
const {coroutine: co, promisify} = require('bluebird');

class SettingsClassMapForm extends Form {
  async init(context) {
    let FormApi = context.engine.pluginRegistry.get('FormApi'),
        Settings = context.engine.pluginRegistry.get('Settings'),
        Select = FormApi.getElement('Select'),
        Button = FormApi.getElement('Button');

    // Put the available locations into an options list.
    let paths = await Settings.cacheRegistry.get('settings/locations.json').load();
    let options = [];
    for (let key in paths) {
      options.push({
        value: key,
        label: paths[key].name,
      });
    }

    // Create a Select box for each Cache object.
    let classes = await Settings.cacheRegistry.get('settings/classMapOverride.json').load();
    for (let cache of Settings.cacheRegistry.getIterator()) {
      if (cache.storageCanChange) {
        this.addElement(new Select(cache.id, {
          attributes: {},
          options: options,
          label: cache.id,
          description: cache.description,
          defaultValues: [classes[cache.id] ? classes[cache.id] : cache.storage],
        }));
      }
    }

    // Submit Button.
    this.addElement(new Button('save', {value: 'save', content: 'Save Changes'}));

    return super.init(context);
  }

  async submit(context) {
    let Settings = context.engine.pluginRegistry.get('Settings'),
        post = context.post[this.name] || {},
        classMapOverrideObj = Settings.cacheRegistry.get('settings/classMapOverride.json'),
        overrides = await classMapOverrideObj.load(),
        changed = false;

    // Determine if new values need to be saved.
    for (let cache of Settings.cacheRegistry.getIterator()) {
      if (cache.storageCanChange) {
        let key = cache.id;
        let selected = Object.values(post[key])[0];
        if ((overrides[key] && overrides[key] !== selected)
          || (!overrides[key] && cache.storage !== selected)) {
          overrides[key] = selected;
          changed = true;
        }
      }
    }

    if (!changed) {
      return;
    }

    let e = await classMapOverrideObj.save();
    if (e) {
      // TODO: Notify user of error.
      console.log(e);
    }
  }
}

module.exports = SettingsClassMapForm;
