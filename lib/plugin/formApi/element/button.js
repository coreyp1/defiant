"use strict";

const Element = require('./element');

class Button extends Element {}

Button.Instance = require('./buttonInstance');

Button.template = 'TagPair';

module.exports = Button;
