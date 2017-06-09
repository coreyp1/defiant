"use strict";

const Plugin = require('../plugin');
const Registry = require('../util/registry');
const merge = require('../util/merge');

class Library extends Plugin {
  constructor(engine) {
    super(engine);
    engine.library = this;
    this.registry = new Registry();
  }

  /**
   * Register a library so that it can be included using require().
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
   * Add the requested library CSS & JS.
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
   * Add the CSS & JS for all requested libraries and their dependencies.
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
