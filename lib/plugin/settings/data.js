"use strict";

const fs = require('fs');
const Path = require('path');
const mkdirp = require('../../util/mkdirp');

/**
 * The Data class serves as a container to store default values for Defiant
 * settings.  See the [Settings]{@link Defiant.Plugin.Settings} documentation
 * for a high-level overview of how the Settings system works.
 *
 * Data objects are identified by a unique id within the registry.  This unique
 * id should mimic the `filename` attribute, which itself is the path to the
 * data file within the storage class to which the Data object is assigned.
 *
 * The id is a path, including the filename and extension.  Because Data files
 * are stored as JSON, an acceptable id would be: `foo/bar.json`.
 *
 * <b>A note about `id` and `filename`.</b>  Both contain the same data in
 * principle, but may have a slight difference depending on the operating
 * system.  In general, an `id` may be `settings/locations.json`, while the
 * `filename` may be `Path.join('settings', 'locations.json')`.  The difference
 * is that the `Path.join()` will use path separators that are proper for the
 * operating system on which it is running, while the `id` is just an identifier
 * that any plugin can reference by the common, forward-slashed convention.
 * @class
 * @memberOf Defiant.Plugin.Settings
 */
class Data {
  /**
   * @constructor
   * @param {Object} attributes
   *   The `attributes` object allows a datapoint to be instantiated without
   *   having to require() an outside file.  See
   *   [Session.readSessionFile()]{@link Defiant.Plugin.Session#readSessionFile},
   *   which abuses the Data object and makes use of its read/write
   *   functionality to store session information.
   *
   *   `attributes` may contain key/value pairs for the following values:
   *   <ul><li>[id]{@link Defiant.Plugin.Settings.Data#id}</li>
   *   <li>[filename]{@link Defiant.Plugin.Settings.Data#filename}</li>
   *   <li>[storage]{@link Defiant.Plugin.Settings.Data#storage}</li>
   *   <li>[storageCanChange]{@link Defiant.Plugin.Settings.Data#storageCanChange}</li>
   *   <li>[description]{@link Defiant.Plugin.Settings.Data#description}</li>
   *   <li>[data]{@link Defiant.Plugin.Settings.Data#data}</li>
   *   <li>[default]{@link Defiant.Plugin.Settings.Data#default}</li>
   *   <li>[reload]{@link Defiant.Plugin.Settings.Data#reload}</li></ul>
   * @param {Defiant.Plugin.Settings} Settings
   *   The instantiated Settings plugin.
   */
  constructor(attributes = {}, Settings = undefined) {
    // Default variables.
    /**
     * @member {String} Defiant.Plugin.Settings.Data#id
     *   A unique identifier that represents the path and filename of the Data
     *   object within the storage class.
     */
    this.id = attributes.id || '';

    /**
     * @member {String} Defiant.Plugin.Settings.Data#filename
     *   The actual path and filename of the Data object within the storage
     *   class.
     */
    this.filename = attributes.filename || 'default.json';

    /**
     * @member {String} Defiant.Plugin.Settings.Data#storage
     *   The storage class for this Data object.
     */
    this.storage = attributes.storage || 'settings';

    /**
     * @member {boolean} Defiant.Plugin.Settings.Data#storageCanChange
     *   Whether or not the storage class can be changed by the user in the UI.
     *   Most notably, this value is false for the
     *   [locations]{@link Defiant.Plugin.Settings#locations} and
     *   [overrides]{@link Defiant.Plugin.Settings#overrides} Data objects
     *   because they must be loaded at system startup.
     */
    this.storageCanChange = attributes.storageCanChange !== undefined ? attributes.storageCanChange : true;

    /**
     * @member {String} Defiant.Plugin.Settings.Data#description
     *   A description of the Data object, to be shown in the admin UI.
     */
    this.description = attributes.description || '';

    /**
     * @member {Object} Defiant.Plugin.Settings.Data#data
     *   Any initialization data.
     */
    this.data = attributes.data || undefined;

    /**
     * @member {Mixed} Defiant.Plugin.Settings.Data#default
     *   The default value of the Data object.
     */
    this.default = attributes.default || {};

    /**
     * @member {boolean} Defiant.Plugin.Settings.Data#reload
     *   Whether or not the Data object should be reloaded rather than read from
     *   the cache (if applicable).
     */
    this.reload = attributes.reload !== undefined ? attributes.reload : true;

    /**
     * @member {Defiant.Plugin.Settings} Defiant.Plugin.Settings.Data#Settings
     *   The instantiated Settings plugin.
     */
    this.Settings = Settings;
  }

  /**
   * Return the path which should be used to save the data.
   * @function
   * @returns {String}
   *   The path for this Data object's storage class.
   */
  getPath() {
    return this.Settings.getPath(this);
  }

  /**
   * Save the data object.
   * @function
   * @async
   * @returns {Object}
   *   The result of the file save.
   */
  async save() {
    let filePathComplete = Path.join(this.getPath(), this.filename),
        filePath = Path.dirname(filePathComplete),
        e = await mkdirp(filePath);
    if (e) {
      return Promise.reject(e);
    }
    return await fs.promises.writeFile(filePathComplete, JSON.stringify(this.data, null, 2));
  }

  /**
   * Load the data object.  If it cannot be loaded from the file, use the
   * default values.
   * @function
   * @async
   */
  async load() {
    if (this.reload) {
      this.reload = false;
      try {
        this.data = JSON.parse(await fs.promises.readFile(Path.join(this.getPath(), this.filename)));
      }
      catch (e) {
        this.data = this.default;
      }
    }
    return this.data;
  }

  /**
   * Delete the data object from the file system.
   * @function
   * @async
   * @returns {Object}
   *   The result of the file delete.
   */
  async remove() {
    return await fs.promises.unlink(Path.join(this.getPath(), this.filename));
  }
}

module.exports = Data;
