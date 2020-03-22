"use strict";

const Renderable = require('./renderable');

/**
 * A Collection is a Renderable that is intended to contain other Renderables.
 * It is used to build [forms]{@link Defiant.Plugin.FormApi} as well as any
 * other structure which is easily decomposed into smaller parts.
 * @class
 * @extends Defiant.Plugin.Theme.Renderable
 * @memberOf Defiant.Plugin.Theme
 */
class Collection extends Renderable {}

Collection.Instance = require('./collectionInstance');

module.exports = Collection;
