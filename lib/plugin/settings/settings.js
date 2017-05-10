'use strict';

const Plugin = require('../plugin');
const AdminHandler = require('../router/handler/adminHandler');
const Registry = require('../../util/registry');
const isEmptyObject = require('../../util/isEmptyObject');
const {coroutine: co} = require('bluebird');
const Path = require('path');

class Settings extends Plugin {
  constructor(engine) {
    super(engine);

    // Declare Registries.
    this.cache = new Registry();

    // Monkey patch cache.set() so that it automatically creates a reference
    // within the data object to `this`.
    let cacheSet = this.cache.set,
        self = this;
    this.cache.set = function set(obj) {
      obj.Settings = self;
      cacheSet.call(self.cache, obj);
    };
  }

  // Initialize the Settings plugin.
  init() {
    return co(function* (self) {
      const FormApi = self.engine.plugin.get('FormApi');

      // Register the forms.
      FormApi
        .setForm(require('./form/settingsPathsForm'))
        .setForm(require('./form/settingsClassMapForm'));

      // Register the handlers.
      self.engine.plugin.get('Router')
        .addHandler(new AdminHandler({
          id: 'Settings.PathsHandler',
          path: 'admin/settings/paths',
          menu: {
            menu: 'admin',
            text: 'Settings Paths',
            description: 'Change the directory where your settings are stored',
          },
          renderable: FormApi.getForm('SettingsPathsForm'),
        }))
        .addHandler(new AdminHandler({
          id: 'Settings.ClassMapHandler',
          path: 'admin/settings/class_map',
          menu: {
            menu: 'admin',
            text: 'Settings Class Map',
            description: 'Change the storage class of individual settings files',
          },
          renderable: FormApi.getForm('SettingsClassMapForm'),
        }));

      // Initilize the Data objects.
      var Data = require('./data');

      self.cache.set(new Data({
        id: 'settings/classMapOverride.json',
        filename: Path.join('settings', 'classMapOverride.json'),
        storage: 'bootstrap',
        storageCanChange: false,
        description: 'This stores the overrides of the storage classes, which are set through the administrative interface.',
        default: {}
      }));
      self.cache.set(new Data({
        id: 'settings/locations.json',
        filename: Path.join('settings', 'locations.json'),
        storage: 'bootstrap',
        storageCanChange: false,
        description: 'This maps storage classes to specific folders',
        default: {
          temporary: {
            name: 'Temporary',
            description: 'Files in this location are volatile and may be deleted.  It is suggested to use a subfolder within your OS\'s temporary folder.',
            directory: Path.join(Path.sep, 'tmp', 'defiant')
          },
          settings: {
            name: 'Settings',
            description: 'Non-security sensitive settings may be placed here.  These files should probably be used in conjunction with version control.',
            directory: Path.join(Path.sep, 'var', 'defiant', 'settings')
          },
          secure: {
            name: 'Secure',
            description: 'Any settings that necessitate higher security concerns (such as API keys, etc.) should be placed here.  Although files in this location may be under version control, access is most likely restricted, and may be different for various environments (e.g. dev, stage, and prod).',
            directory: Path.join(Path.sep, 'var', 'defiant', 'secure')
          },
          development: {
            name: 'Development',
            description: 'Settings that may change from environment to environment, and which are probably not shared nor put into version control may be placed here.  These files, although potentially unique to a particular installation, are non-volatile.  This is different from Temporary storage, whose files are not guaranteed to exist when Defiant is restarted.',
            directory: Path.join(Path.sep, 'var', 'defiant', 'dev')
          },
          sessions: {
            name: 'Sessions',
            description: 'Directory where session information is stored.',
            directory: Path.join(Path.sep, 'var', 'defiant', 'sessions')
          }
        }
      }));

      // Normally, variables will be loaded as needed.  For bootstrap
      // purposes, though, 'settings/locations.json' and
      // 'settings/classMapOverride.json' must be loaded now.
      self.locations = self.cache.get('settings/locations.json');
      yield self.locations.load();
      self.overrides = self.cache.get('settings/classMapOverride.json');
      yield self.overrides.load();
    })(this);
  }

  // Return the correct mapping for the provided Data object.
  getPath(dataObj) {
    if (!dataObj.storageCanChange) {
      return this.getStorageLocation(dataObj.storage);
    }
    return this.getStorageLocation(this.overrides.data[dataObj.filename] || dataObj.storage);
  }

  // Return the storage location for the provided storage class.
  getStorageLocation(storageClass) {
    // 'bootstrap' is always a special case.
    if (storageClass == 'bootstrap') {
      return this.engine.bootstrapDirectory;
    }
    if (!isEmptyObject(this.locations.data[storageClass])) {
      return this.locations.data[storageClass].directory || this.locations.data.settings.directory;
    }
    return this.locations.data.settings.directory;
  }
}

module.exports = Settings;
