"use strict";

const path = require('path');
const fs = require('fs');
const {coroutine: co, promisify} = require('bluebird');

const mkdir = promisify(fs.mkdir);
const fsstat = promisify(fs.stat);

module.exports = function mkdirp (filePath, options = {chmod: 0o700}) {
  // Closure variables
  let check = filePath.split(path.sep);
  let toCreate = [];
  let previousError = undefined;

  return co(function* () {
    while (true) {
      // Optimistically try to create the deepest directory.
      let e,
          currentPath = check.join(path.sep);
      try {
        e = yield mkdir(currentPath, options.chmod);
      }
      catch(err) {
        e = err;
      }

      if (e) {
        // There has been an error.
        if (e.code == "EEXIST") {
          // Something exists here.  Determine if it is a file or directory.
          let stat = yield fsstat(currentPath);
          if (!stat.isDirectory()) {
            // Whatever is here, it is not a directory.
            return Promise.reject(e);
          }

          // The directory already exists.  If this is the first attempt, then
          // 'previousError' will be undefined, and no "error" will be returned.
          // If, however, the directory already exists and this is not the first
          // attempt, then the error from the previous attempt is what was
          // important, and therefore will be returned.
          return previousError !== undefined ? Promise.reject(previousError) : Promise.resolve();
        }
        if (e.code == 'EACCES') {
          // We do not have access to this folder.
          return Promise.reject(e);
        }

        // Some other error was returned, so back up one level and try again.
        previousError = e;
        toCreate.unshift(check.pop());
        continue;
      }

      if (toCreate.length == 0) {
        // The total directory structure was created without error.
        return Promise.resolve();
      }

      // Last option. The current level was created, but there are more levels
      // to go.  Queue up the next level for creation.
      check.push(toCreate.shift());
    }
  })().catch(e => {
    return e;
  });
};
