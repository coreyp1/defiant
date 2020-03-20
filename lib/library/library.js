"use strict";

const Plugin = require('../plugin');
const Registry = require('../util/registry');
const merge = require('../util/merge');
/**
 * See {@link Defiant.Library.register}.
 * @typedef Defiant.Library.RegistryData
 * @prop {String} id The unique id for this entry.
 * @prop {String[]} require Any dependencies that this entry has.
 * @prop {Defiant.Library.RegistryDataEntry[]} css The CSS files to include.
 * @prop {Defiant.Library.RegistryDataEntry[]} js The JavaScript files to
 *   include.
 * @prop {Defiant.Library.RegistryDataEntry[]} jsFooter The JavaScript files to
 *   include.
 */
/**
 * See {@link Defiant.Library.RegistryData}.
 * @typedef Defiant.Library.RegistryDataEntry
 * @type {Object}
 * @prop {String} id The unique id for this entry.
 * @prop {String} url The URL from which this entry may be accessed.
 * @prop {String} path If the file is located on the local file system, this is
 *   the path to that location.
 */
/**
 * A Library plugin to manage 3rd party libraries.
 *
 * Provides a federated api for including CSS and JavaScript into a page's
 * final render.
 * @class
 * @memberOf Defiant
 */
class Library extends Plugin {
  /**
   * @constructor
   * @param {Defiant.Engine} engine The app engine.
   * @returns {Defiant.Library} The plugin library.
   */
  constructor(engine) {
    super(engine);
    /**
     * @member {Defiant.Library} Defiant.Engine#library A reference to the
     * library plugin.
     */
    engine.library = this;
    /**
     * @member {Defiant.util.Registry} Defiant.Library#registry A registry of
     *   library plugins.
     */
    this.registry = new Registry();
  }

  /**
   * Register a library so that it can be included using
   * [engine.library.require()]{@link Defiant.Library.require}.
   * @function
   * @param {Defiant.Library.RegistryData} data The requirements of this
   *   library.
   * @returns {Defiant.Library} The plugin library.
   */
  register(data) {
    this.registry.set(merge({
      id : '',
      require: [],
      css: [],
      js: [],
      jsFooter: [],
    }, data));
    for (let dependency of data.dependency || []) {
      this.addDependency(data.id, dependency);
    }
    return this;
  }

  /**
   * Add the requested library CSS & JavaScript to the page load.
   * @function
   * @param {Defiant.Context} context The request context.
   * @param {String} libraryId The id of the library that needs to be included.
   * @returns {Defiant.Library} The plugin library.
   */
  require(context, libraryId) {
    if (this.registry.get(libraryId)) {
      if (!context.includeLibraries) {
        context.includeLibraries = [];
      }
      context.includeLibraries.push(libraryId);
    }
    return this;
  }

  /**
   * Add the CSS & JavaScript for all requested libraries and their dependencies
   * to the page templating system.
   * @function
   * @param {Defiant.Context} context The request context.
   */
  process(context) {
    // Compute the weights for all needed libraries.
    let weights = {};
    let maxWeight = 0;
    (context.includeLibraries || []).map(libraryId =>
      maxWeight = this.computeWeights(weights, libraryId)
    );
    maxWeight++;

    // Include the CSS & JS.
    for (let libraryId in weights) {
      let weight = weights[libraryId];
      let library = this.registry.get(libraryId);
      ['css', 'js', 'jsFooter'].map(region =>
        (library[region] || []).map(entry =>
          context[`${region}Registry`].set(merge({weight: weight - maxWeight}, entry))
        )
      );
    }
  }

  /**
   * Recursive function to determine the ordering of the requested library.
   * @function
   * @param {Map<String, number>} weights The known weights of the libraries.
   * @param {String} libraryId The id for the library whose weight needs to be
   *   computed.
   * @returns {number} The weight of the library identified by `libraryId`.
   */
  computeWeights(weights, libraryId) {
    if (!weights[libraryId]) {
      let library = this.registry.get(libraryId);
      let max = 0;
      if (library) {
        for (let requireId of library.require || []) {
          max = Math.max(max, this.computeWeights(weights, requireId));
        }
      }
      weights[libraryId] = max + 1;
    }
    return weights[libraryId];
  }
}

module.exports = Library;
