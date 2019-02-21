"use strict";

const Renderable = require('./renderable');

class Collection extends Renderable {}

Collection.Instance = require('./collectionInstance');

module.exports = Collection;
