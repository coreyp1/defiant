"use strict";

/**
 * Recursively merge object `b` into object `a`.
 *
 * Object `a` is the first argument, object `b` is the second argument.  If
 * there is an object `c`, then `b` will be merged into `a`, followed by `c`
 * being merged into `a`, etc.
 *
 * If `a` and `b` are not compatible types, then `b` will replace `a`.
 *
 * If they are sets, then the result is a union of `a` and `b`.
 *
 * If they are any other type of object, then the key/value pairs from `b` are
 * recursively merged into `a`.
 * @name Defiant.util.merge
 * @param {...*} args Objects to merge.
 * @returns {*} The merged object.
 * @function
 * @memberOf Defiant.util
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
