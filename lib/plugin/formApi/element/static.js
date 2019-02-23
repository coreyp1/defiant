"use strict";

const Hidden = require('./hidden');

class Static extends Hidden {}

Static.Instance = require('./staticInstance')

module.exports = Static;
