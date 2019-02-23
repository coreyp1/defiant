"use strict";

const Element = require('./element');

class Text extends Element {}

Text.Instance = require('./textInstance');
module.exports = Text;
