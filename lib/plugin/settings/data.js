"use strict";

const fs = require('fs');
const Path = require('path');
const mkdirp = require('../../util/mkdirp');

class Data {
  // The 'attributes' object allows a datapoint to be instantiated without having
  // to require() an outside file.  See Session.readSessionFile().
  constructor(attributes = {}, Settings = undefined) {
    // Default variables.
    this.id = attributes.id || '';
    this.filename = attributes.filename || 'default.json';
    this.storage = attributes.storage || 'settings';
    this.storageCanChange = attributes.storageCanChange !== undefined ? attributes.storageCanChange : true;
    this.description = attributes.description || '';
    this.data = attributes.data || undefined;
    this.default = attributes.default || {};
    this.reload = attributes.reload !== undefined ? attributes.reload : true;
    this.Settings = Settings;
  }

  // Return the path which should be used to save the data.
  getPath() {
    return this.Settings.getPath(this);
  }

  // Save the data object.
  async save() {
    let filePathComplete = Path.join(this.getPath(), this.filename),
        filePath = Path.dirname(filePathComplete),
        e = await mkdirp(filePath);
    if (e) {
      return Promise.reject(e);
    }
    return await fs.promises.writeFile(filePathComplete, JSON.stringify(this.data, null, 2));
  }

  // Load the data object.  If it cannot be loaded from the file, use the default
  // values.
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

  // Delete the data object.
  async remove() {
    return await fs.promises.unlink(Path.join(this.getPath(), this.filename));
  }
}

module.exports = Data;
