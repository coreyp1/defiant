'use strict';

const Form = require('../../fapi/form');
const {coroutine: co, promisify} = require('bluebird');

class SettingsClassMapForm extends Form {
  init(context) {
    let Fapi = context.engine.plugin.get('Fapi'),
        Settings = context.engine.plugin.get('Settings'),
        Select = Fapi.getElement('Select'),
        Button = Fapi.getElement('Button');

    return co(function*(self, superInit) {
      // Put the available locations into an options list.
      let paths = yield Settings.cache.get('settings/locations.json').load();
      let options = [];
      for (let key in paths) {
        options.push({
          value: key,
          label: paths[key].name,
        });
      }

      // Create a Select box for each Cache object.
      let classes = yield Settings.cache.get('settings/classMapOverride.json').load();
      for(let cache of Settings.cache.getIterator()) {
        if (cache.storageCanChange) {
          self.addElement(new Select(cache.id, {
            attributes: {},
            options: options,
            label: cache.id,
            description: cache.description,
            defaultValues: [classes[cache.id] ? classes[cache.id] : cache.storage],
          }));
        }
      }

      // Submit Button.
      self.addElement(new Button('save', {value: 'save', content: 'Save Changes'}));

      return yield superInit.call(self, context);
    })(this, super.init);
  }

  submit(context) {
    return co(function* (self) {
      let Settings = context.engine.plugin.get('Settings'),
          post = context.post[self.name] || {},
          classMapOverrideObj = Settings.cache.get('settings/classMapOverride.json'),
          overrides = yield classMapOverrideObj.load(),
          changed = false;

      // Determine if new values need to be saved.
      for(let cache of Settings.cache.getIterator()) {
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

      let e = yield classMapOverrideObj.save();
      if (e) {
        // TODO: Notify user of error.
        console.log(e);
      }
    })(this);
  }
}

module.exports = SettingsClassMapForm;
