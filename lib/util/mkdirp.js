"use strict";

const path = require('path');
const fs = require('fs');

/**
 * Create a complete path of directories.
 *
 * The standard mkdir can only make one directory at a time.  This command will
 * attempt to make the missing "parent" directories as well, similar to the
 * `mkdir -p` shell command.
 * @name Defiant.util.mkdirp
 * @param {String} filePath The path that needs to exist.
 * @param {Object} [options={chmod: 0o700}] The options to pass to the internal
 *   `fs.mkdir()` function.
 * @returns {Promise} The fundamental result from `fs.mkdir()`.
 * @function
 * @memberOf Defiant.util
 */
module.exports = function mkdirp (filePath, options = {chmod: 0o700}) {
  // Closure variables
  let check = filePath.split(path.sep);
  let toCreate = [];
  let previousError = undefined;

  return new Promise(async (accept, reject) => {
    while (true) {
      // Optimistically try to create the deepest directory.
      let e,
          currentPath = check.join(path.sep);
      try {
        e = await fs.promises.mkdir(currentPath, options.chmod);
      }
      catch(err) {
        e = err;
      }

      if (e) {
        // There has been an error.
        if (e.code == "EEXIST") {
          // Something exists here.  Determine if it is a file or directory.
          let stat = await fs.promises.stat(currentPath);
          if (!stat.isDirectory()) {
            // Whatever is here, it is not a directory.
            return reject(e);
          }

          // The directory already exists.  If this is the first attempt, then
          // 'previousError' will be undefined, and no "error" will be returned.
          // If, however, the directory already exists and this is not the first
          // attempt, then the error from the previous attempt is what was
          // important, and therefore will be returned.
          return previousError !== undefined ? reject(previousError) : accept();
        }
        if (e.code == 'EACCES') {
          // We do not have access to this folder.
          return reject(e);
        }

        // Some other error was returned, so back up one level and try again.
        previousError = e;
        toCreate.unshift(check.pop());
        continue;
      }

      if (toCreate.length == 0) {
        // The total directory structure was created without error.
        return accept();
      }

      // Last option. The current level was created, but there are more levels
      // to go.  Queue up the next level for creation.
      check.push(toCreate.shift());
    }
  }).catch(e => {
    return e;
  });
};
