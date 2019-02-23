"use strict";

const Hidden = require('./hidden');

class Encrypt extends Hidden {}

Encrypt.Instance = require('./encryptInstance');

module.exports = Encrypt;
