"use strict";

module.exports = function* range(...vals) {
  const [min, max] = vals.length == 2 ? vals : [0, vals[0] == undefined ? -1 : vals[0]];
  let current = min;
  while (current <= max) {
    yield current++;
  }
};
