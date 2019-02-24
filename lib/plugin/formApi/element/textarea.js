"use strict";

const Element = require('./element');

class Textarea extends Element {}

Textarea.Instance = require('./textareaInstance');

module.exports = Textarea;
