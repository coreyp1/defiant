"use strict";

const Element = require('./element');

class GenericRenderable extends Element {}

GenericRenderable.Instance = require('./genericRenderableInstance');

module.exports = GenericRenderable;
