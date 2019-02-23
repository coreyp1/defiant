"use strict";

const Element = require('./element');

class Password extends Element {}

Password.Instance = require('./passwordInstance');

module.exports = Password;
