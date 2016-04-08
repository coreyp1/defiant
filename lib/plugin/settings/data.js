"use strict";

const fs = require('fs');
const Path = require('path');
const mkdirp = require('../../util/mkdirp');
const {coroutine: co, promisify} = require('bluebird');
const fsWriteFile = promisify(fs.writeFile);
const fsUnlink = promisify(fs.unlink);
const fsReadFile = promisify(fs.readFile);

class Data {
  // The 'attributes' object allows a datapoint to be instantiated without having
  // to require() an outside file.  See Session.readSessionFile().
  constructor(attributes = {}) {
    // Default variables.
    this.id = attributes.id || '';
    this.filename = attributes.filename || 'default.json';
    this.storage = attributes.storage || 'settings';
    this.storageCanChange = attributes.storageCanChange || true;
    this.description = attributes.description || '';
    this.data = attributes.data || undefined;
    this.default = attributes.default || {};
    this.reload = attributes.reload || true;
  }

  // Return the path which should be used to save the data.
  getPath() {
    return this.Settings.getPath(this);
  };

  // Save the data object.
  save() {
    return co(function* (self) {
      let filePathComplete = Path.join(self.getPath(), self.filename),
          filePath = Path.dirname(filePathComplete),
          e = yield mkdirp(filePath);
      if (e) {
        return Promise.reject(e);
      }
      return yield fsWriteFile(filePathComplete, JSON.stringify(self.data, null, 2));
    })(this);
  };

  // Load the data object.  If it cannot be loaded from the file, use the default
  // values.
  load() {
    return co(function* (self) {
      if (self.reload) {
        self.reload = false;
        try {
          self.data = JSON.parse(yield fsReadFile(Path.join(self.getPath(), self.filename)));
        }
        catch (e) {
          self.data = self.default;
        }
      }
      return self.data;
    })(this);
  };

  // Delete the data object.
  remove() {
    return co(function* (self) {
      return yield fsUnlink(Path.join(self.getPath(), self.filename));
    })(this);
  };
}

module.exports = Data;
