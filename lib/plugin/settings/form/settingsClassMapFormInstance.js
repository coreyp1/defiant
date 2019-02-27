'use strict';

const FormInstance = require('../../formApi/formInstance');

class SettingsClassMapFormInstance extends FormInstance {
  async init(data={}) {
    let FormApi = this.context.engine.pluginRegistry.get('FormApi'),
        Settings = this.context.engine.pluginRegistry.get('Settings'),
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
        this.addInstance(Select.newInstance(this.context, {
          name: cache.id,
          data: {
            attributes: {},
            options: options,
            label: cache.id,
            description: cache.description,
            defaultValues: [classes[cache.id] ? classes[cache.id] : cache.storage],
          },
        }));
      }
    }

    // Submit Button.
    this.addInstance(Button.newInstance(this.context, {
      name: 'save',
      data: {
        value: 'save',
        content: 'Save Changes',
      },
    }));

    await super.init(data);
  }

  async submit() {
    let Settings = this.context.engine.pluginRegistry.get('Settings'),
        post = this.context.post[this.id] || {},
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

module.exports = SettingsClassMapFormInstance;
