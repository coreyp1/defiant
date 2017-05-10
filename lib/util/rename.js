"use strict";

const mkdirp = require('./mkdirp');
const path = require('path');
const fs = require('fs');
const {coroutine: co, promisify} = require('bluebird');
const mv = promisify(fs.rename);
const stat = promisify(fs.stat);
const fsstat = promisify(fs.stat);

module.exports = function rename(oldPath, newPath) {
  return co(function*() {
    let dirname = path.dirname(newPath);
    let ext = path.extname(newPath);
    let basename = path.basename(newPath, ext);
    let safeNewPath = newPath;
    let exists = false;

    // Make sure that the newPath directory is not a file.
    let counter = 0;
    let safeDirname = dirname;
    do {
      try {
        // fsstat will throw on error (e.g., the directory does not exist).
        let stat = yield fsstat(safeDirname);

        // Something exists with this name.
        if (stat.isDirectory()) {
          // It is OK to use an existing directory.
          break;
        }
        // It is not a directory, so try to find a new directory.
        safeDirname = `${safeDirname}.${counter}`;
        counter++;
      }
      catch (e) {
        if (e.code == 'ENOENT') {
          // The directory does not exist.
          // This is good.
          break;
        }
      };
    } while (true);

    // Find an unused filename.
    let safeNewName = path.join(dirname, basename + (ext ? `${ext}` : ''));
    counter = 0;
    do {
      try {
        // fsstat will throw on error (e.g., the directory does not exist).
        let stat = yield fsstat(safeNewName);

        // Something exists with this name.
        // Try to find an unused filename.
        safeNewName = path.join(safeDirname, basename + `.${counter}` + (ext ? `${ext}` : ''));
        counter++;
      }
      catch (e) {
        if (e.code == 'ENOENT') {
          // The file does not exist.
          // This is good.
          break;
        }
      }
    } while (true);

    // Make the directory (if needed).
    let e = yield mkdirp(safeDirname);
    if (e) {
      return e;
    }

    // Finally, try to move the file.
    try {
      yield mv(oldPath, safeNewName);
    }
    catch (e) {
      return e;
    }
    return safeNewName;
  })();
}