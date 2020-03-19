"use strict";

const mkdirp = require('./mkdirp');
const path = require('path');
const fs = require('fs');

/**
 * Rename a path without overwriting an existing path.
 *
 * If the desired new path already exists, then a counter is incremented and
 * appended to the desired path name.  This process is repeated until an unused
 * path name is found.
 *
 * For example, if `/tmp/abc` is the desired path, but that path already exists,
 * then `/tmp/abc.0` will be tried, followed by `/tmp/abc.1`, etc.
 * @name Defiant.util.rename
 * @param {String} oldPath The path that needs to be renamed.
 * @param {String} newPath The desired new path.
 * @returns {String} If a `newPath` was successfully found.
 * @returns {Error} If `oldPath` could not be renamed.
 * @function
 * @async
 * @memberOf Defiant.util
 */
module.exports = async function rename(oldPath, newPath) {
  let dirname = path.dirname(newPath);
  let ext = path.extname(newPath);
  let basename = path.basename(newPath, ext);

  // Make sure that the newPath directory is not a file.
  let counter = 0;
  let safeDirname = dirname;
  do {
    try {
      // this will throw on error (e.g., the directory does not exist).
      let stat = await fs.promises.stat(safeDirname);

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
    }
  } while (true);

  // Find an unused filename.
  let safeNewName = path.join(dirname, basename + (ext ? `${ext}` : ''));
  counter = 0;
  do {
    try {
      // this will throw on error (e.g., the directory does not exist).
      await fs.promises.stat(safeNewName);

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
  let e = await mkdirp(safeDirname);
  if (e) {
    return e;
  }

  // Finally, try to move the file.
  try {
    await fs.promises.rename(oldPath, safeNewName);
  }
  catch (e) {
    return e;
  }
  return safeNewName;
}
