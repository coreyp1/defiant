"use strict";

/**
 * Test whether or not an object is empty.
 * @name Defiant.util.isEmptyObject
 * @function
 * @param {Object} obj The object to test.
 * @returns {boolean}
 *   Returns `true` if `obj` is an object that also has an attribute.
 * @memberOf Defiant.util
 */
module.exports = function isEmptyObject(obj) {
  if (typeof obj != 'object') {
    return false;
  }
  for (let name in obj) {
    return false;
  }
  return true;
};
