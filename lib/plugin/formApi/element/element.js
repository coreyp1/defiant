"use strict";

const Collection = require('../../theme/renderable/collection');

class Element extends Collection {}

Element.Instance = require('./elementInstance');
module.exports = Element;
