"use strict";

/**
 * Recursively merge object b into object a.
 */
module.exports = function merge (...args) {
  let a = args[0];
  let b;
  for (let i = 1; i < args.length; i++) {
    b = args[i];
    if ((typeof a !== typeof b) || (!a) || (b === null)) {
      a = b;
    }
    else if ((a.constructor === Array) && (b.constructor === Array)) {
      a = a.concat(b);
    }
    else if (typeof b == 'object') {
      for (let key in b) {
        a[key] = (typeof a[key] == 'object') ? merge(a[key], b[key]) : b[key];
      }
    }
  }
  return a;
};
