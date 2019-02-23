"use strict";

const Element = require('./element');
const he = require('he');

class Hidden extends Element {}

Hidden.Instance = require('./hiddenInstance');

module.exports = Hidden;
