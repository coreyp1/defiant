"use strict";

/**
 * Helper function to run another function (`fn`) in a `try..catch` block.
 * @name Defiant.util.tryCatch
 * @param {function} fn The function to be run.
 * @param {Array} [args=[]] The arguments to pass to the function `fn`.
 * @returns {*} If the function succeeds, returns the result of `fn`.
 * @returns {Error} If the function fails, returns the error that was caught.
 * @function
 * @memberOf Defiant.util
 */
module.exports = function tryCatch(fn, args=[]) {
  try {
    return fn(...args);
  }
  catch(e) {
    return e;
  }
}
