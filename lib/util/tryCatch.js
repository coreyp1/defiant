"use strict";

module.exports = function tryCatch(fn) {
  try {
    fn();
  }
  catch(e) {
    return e;
  }
}
