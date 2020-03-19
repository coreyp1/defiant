"use strict";

/**
 * Generates a range of integers.
 * @name Defiant.util.range
 * @generator
 * @function
 * @param [number=0] min
 * @param [number=0] max
 * @yields {number} The next number in the range.
 * @memberOf Defiant.util
 */
module.exports = function* range(...vals) {
  const [min, max] = vals.length == 2 ? vals : [0, vals[0] == undefined ? -1 : vals[0]];
  let current = min;
  while (current <= max) {
    yield current++;
  }
};
