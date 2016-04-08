"use strict";

/**
 * Test whether or not an object is empty.
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
