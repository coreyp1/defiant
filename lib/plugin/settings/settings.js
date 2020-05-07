'use strict';

const Plugin = require('../plugin');
const AdminHandler = require('../router/handler/adminHandler');
const Registry = require('../../util/registry');
const isEmptyObject = require('../../util/isEmptyObject');
const Path = require('path');
const Form = require('../formApi/form');

/**
 * The Settings plugin provides the structure for plugins to have settings which
 * are designed to be overridden, and whose overridden values can be stored in
 * the filesystem in configurable locations.
 *
 * A single setting is stored using the
 * [Data]{@link Defiant.Plugin.Settings.Data} object.  When a data object is
 * added to the [cacheRegistry]{@link Defiant.Plugin.Settings#cacheRegistry},
 * and the value is tracked by Defiant.  When a Data value is changed, then
 * Defiant will write that change to a corresponding file on the file system.
 * When the Data value is requested, then Defiant will first look to see if
 * a file (with an overridden value) exists, and if so, will return the
 * overridden value.  Otherwise, the default value is returned.  Some caching
 * is used to increase performance.
 *
 * Data objects can be declared to have a specific
 * [storage]{@link Defiant.Plugin.Settings.Data#storage} class, which, in
 * effect, groups the Data objects by similar type.  Each storage class
 * (i.e., grouping) can be assigned a specific folder on the file system.
 * Defiant provides a UI which the user can use to override the assigned storage
 * class of individual Data objects, thereby allowing customization to how Data
 * objects are stored on the system.
 *
 * The end result of such a system is to provide flexibility and robustness
 * in Dev/Stage/Prod environments by way of the following features:
 * <ul><li>No settings are put into the database.  Period.</li>
 * <li>All settings are written to the file system if they are changed from
 * their default value, and can therefore be tracked with a version control
 * system.</li>
 * <li>Because the Data object `storage` class is customizable, different Data
 * objects can be stored in different directories, and therefore controlled by
 * different repositories.</li>
 * <li>In this architecture, some Data object values may be customized depending
 * on which part of the dev/stage/prod workflow that they are in.
 *
 * As a simple example, suppose that an app uses a plugin with an API key.
 * Suppose also that the dev environments should only use a test API key, while
 * the prod servers use a live key.  Defiant could support this setup by
 * configuring the storage class of the API key Data object to be a specific
 * directory.  This directory could then be managed by different repos on a dev
 * environment vs a prod environment.  In the dev environment, the dev version
 * of the Data object can be stored, perhaps in a dev settings repository.  In
 * the prod environment, the production version of the Data object can be
 * stored, perhaps in a prod settings repository.
 *
 * A different, simpler example would be a theme color change that makes it
 * obvious as to which environment is being used.
 *
 * This same setup would allow for any production or otherwise sensitive data to
 * be stored separately from the main code repository.</li></ul>
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Plugin
 */
class Settings extends Plugin {
  /**
   * Process a notification that some `plugin` has performed some `action`.
   * @function
   * @async
   * @param {Defiant.Plugin} plugin
   *   The Plugin to which the `action` pertains.
   * @param {String} action
   *   The action being performed.  Example actions include "pre-enable",
   *   "enable", "disable", "update".
   * @param {Mixed} [data=NULL]
   *   Any supplementary information.
   */
  async notify(plugin, action, data=null) {
    super.notify(plugin, action, data);
    switch (action) {
      case 'pre:enable':
        // Declare Registries.
        /**
         * @member {Defiant.util.Registry} Defiant.Plugin.Settings#cacheRegistry
         * The cacheRegistry holds all the
         *   [Data]{@link Defiant.Plugin.Settings.Data} objects that are declared by
         *   other plugins.  Plugins can request a Data object from this Registry
         *   and inspect its value.
         */
        this.cacheRegistry = new Registry();

        // Monkey patch cache.set() so that it automatically creates a reference
        // within the data object to `this`.
        let cacheSet = this.cacheRegistry.set,
            self = this;
        this.cacheRegistry.set = function set(obj) {
          obj.Settings = self;
          cacheSet.call(self.cacheRegistry, obj);
        };

        // Initilize the Data objects.
        var Data = require('./data');

        // Storage class overrides.
        this.cacheRegistry.set(new Data({
          id: 'settings/classMapOverride.json',
          filename: Path.join('settings', 'classMapOverride.json'),
          storage: 'bootstrap',
          storageCanChange: false,
          description: 'This stores the overrides of the storage classes, which are set through the administrative interface.',
          default: {}
        }));

        // Storage class folder mapping.
        this.cacheRegistry.set(new Data({
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
        /**
         * @member {Defiant.Plugin.Settings.Data} Defiant.Plugin.Settings#locations
         *   Special-instance Data object that stores the settings locations.
         */
        this.locations = this.cacheRegistry.get('settings/locations.json');
        await this.locations.load();

        /**
         * @member {Defiant.Plugin.Settings.Data} Defiant.Plugin.Settings#overrides
         *   Special-instance Data object that stores all of the overrides for the
         *   Data objects' storage class.
         */
        this.overrides = this.cacheRegistry.get('settings/classMapOverride.json');
        await this.overrides.load();

        for (let existingPlugin of ['FormApi', 'Router'].map(name => this.engine.pluginRegistry.get(name))) {
          if (existingPlugin instanceof Plugin) {
            await this.notify(existingPlugin, 'enable');
          }
        }
        break; // pre-enable

      case 'enable':
        switch ((plugin || {}).id) {
          case 'FormApi':
            // Register the forms.
            plugin
              .setForm(new Form(this.engine, {
                id: 'SettingsPathsForm',
                Instance: require('./form/settingsPathsFormInstance'),
              }))
              .setForm(new Form(this.engine, {
                id: 'SettingsClassMapForm',
                Instance: require('./form/settingsClassMapFormInstance'),
              }));

            this.notify(this.engine.pluginRegistry.get('Router'), 'enable');
            break; // FormApi

          case 'Router':
            const FormApi = this.engine.pluginRegistry.get('FormApi');

            // The Router item cannot be added until after FormApi exists.
            if (FormApi instanceof Plugin) {
              // Register the handlers.
              plugin
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
            }
            break; // Router
        }
        break; // enable

      case 'pre:disable':
        // @todo: Remove forms from FormApi.
        // @todo: Remove handlers from Router.
        break; // pre:disable

      case 'disable':
        // @todo: If FormApi is being disabled, then remove handlers from Router.
        break; // disable
    }
  }


  /**
   * Add the necessary handlers when both FormApi and Router plugins have
   * already been enabled.
   * @todo Prevent this from adding the Handlers multiple times.
   * @function
   */
  FormApi_Router_enabled() {
    const FormApi = this.engine.pluginRegistry.get('FormApi');
    const Router = this.engine.pluginRegistry.get('Router');

    if ((FormApi instanceof Plugin) && (Router instanceof Plugin)) {
    }
  }

  /**
   * Return the correct mapping for the provided Data object.  If the default
   * mapping has been overridden, return the overridden values.
   * @function
   * @param {Defiant.Plugin.Settings.Data} dataObj
   *   The Data object in question.
   * @returns {String}
   *   The storage class.
   */
  getPath(dataObj) {
    if (!dataObj.storageCanChange) {
      return this.getStorageLocation(dataObj.storage);
    }
    return this.getStorageLocation(this.overrides.data[dataObj.filename] || dataObj.storage);
  }

  /**
   * Return the storage location for the provided storage class.
   * @function
   * @param {String} storageClass
   *   The storage class in question.
   * @returns {String}
   *   The location of that storage class.
   */
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
