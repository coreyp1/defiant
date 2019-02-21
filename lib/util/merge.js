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
    else if (typeof a == 'object' && typeof b == 'object') {
      if (a instanceof Set) {
        a = new Set([...a, ...b]);
      }
      else if (a instanceof Array) {
        a = a.concat(b);
      }
      else {
        for (let key in b) {
          a[key] = (typeof a[key] == 'object') ? merge(a[key], b[key]) : b[key];
        }
      }
    }
    else {
      // They are incompatible types.
      a = b;
    }
  }
  return a;
};
