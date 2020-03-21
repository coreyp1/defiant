"use strict";

const Registry = require('../../util/registry');

/**
 * The router Item object is used to hold a collection of
 * [handlers]{@link Defiant.Plugin.Router.Handler} that match the same request
 * url.
 *
 * Internally, items are nested in a tree structure and new items can be created
 * as needed to support the addition of new handlers.
 *
 * Handlers are stored in a registry, so they can have an associated weight and
 * insertion order.
 *
 * Handler paths may be either explicit or with a wildcard (`*`).
 *
 * Partial matches are also included.  For example, the handler for `/` would
 * match the url request for `/foo`.  The handler for `/*` would also match
 * against `/foo`.  The handler for `/foo/bar` would not match against `/foo`.
 * @class
 * @memberOf Defiant.Plugin.Router
 */
class Item {
  /**
   * Called by the [Router]{@link Defiant.Plugin.Router} constructor, and then
   * only internally after that.
   * @constructor
   * @param {number} [depth=0] The depth in the tree of the insertion. For
   *   internal use.
   * @returns {Defiant.Plugin.Router.Item} The Router Item that was created.
   */
  constructor(depth = 0) {
    /**
     * @member {Defiant.util.Registry} Defiant.Plugin.Router.Item#handlerRegistry
     *   Registry to store the supplied
     *   [handlers]{@link Defiant.Plugin.Router.Handler}.
     */
    this.handlerRegistry = new Registry();
    /**
     * @member {Map<string,Defiant.Plugin.Router.Item>} Defiant.Plugin.Router.Item#subquery
     *   Map of all subqueries of the next depth and their associated
     *   [Item]{@link Defiant.Plugin.Router.Item}.
     */
    this.subquery = new Map();
    /**
     * @member {number} Defiant.Plugin.Router.Item#depth The depth of this item
     *   in the Item tree.
     */
    this.depth = depth;
    return this;
  }

  /**
   * Add a handler to the item tree.
   * @function
   * @param {Defiant.Plugin.Router.Handler} handler Add a handler to the Item
   *   tree.
   * @returns {Defiant.Plugin.Router.Item} The router item on which the function
   *   was called.
   */
  addHandler(handler) {
    let path = handler.path.split('/').slice(this.depth, this.depth + 1)[0] || '';
    if (path == '') {
      this.handlerRegistry.set(handler);
    }
    else {
      if (!this.subquery.has(path)) {
        this.subquery.set(path, new Item(this.depth + 1));
      }
      this.subquery.get(path).addHandler(handler);
    }
    return this;
  }

  /**
   * Return a list of all handlers that match the requested `url` from the
   * current Item as well as any child Items.
   * @function
   * @param {string} url The url to match against.
   * @returns {Defiant.Plugin.Router.Handler[]} A sorted array of matching
   *   Handlers.
   */
  collectHandlers(url) {
    if (typeof url == 'string') {
      url = url.split('/').map(path => path.trim()).filter(path => path !== '');
    }
    let path = url.slice(this.depth, this.depth + 1)[0] || '',
        handlers = [];
    if (path != '') {
      if (this.subquery.has(path)) {
        // If the next URL part is in the router, then try to match against it.
        handlers.push(...this.subquery.get(path).collectHandlers(url));
      }
      if (this.subquery.has('*')) {
        // If there is an appropriate wildcard, try to add it.
        handlers.push(...this.subquery.get('*').collectHandlers(url));
      }
    }
    handlers.push(...Array.from(this.handlerRegistry.getIterator()));
    return handlers;
  }

  /**
   * Sort an array of [Handlers]{@link Defiant.Plugin.Router.Handlers}.
   *
   * Handlers are sorted first by weight.
   *
   * Handlers of equal weight are then sorted by the exactness of their path.
   * Computing exactness is done as follows:
   * <ol><li>For each part of the Handler's path, if the part is explicit, give
   *   a value of 1 divided by the count of the part from the beginning of the
   *   path.  If the part is a wildcard, give a value of 0.</li>
   * <li> Sum the values for the individual parts.</li></ol>
   *   For example, the path `/foo/bar` has a value of 1.5.  `/* /bar` has a
   *   value of .5.  (Note: there should not be a space after the asterisk, but
   *   that is a limitation of the commenting language.  Let me know if you find
   *   a better way.)
   * @function
   * @static
   * @param {Defiant.Plugin.Router.Handler[]} The array of Handlers to be
   *   sorted.
   * @returns {Defiant.Plugin.Router.Handler[]} The sorted array of Handlers.
   */
  static sortHandlers(handlers) {
    return handlers.sort((a, b) => {
      let aWeight = a.weight || 0;
      let bWeight = b.weight || 0;
      if (aWeight != bWeight) {
        return aWeight - bWeight;
      }
      // They have equal weights.  Sort by most-exact path.
      aWeight = a.path.split('/').map((y, i) => y == '*' ? 0 : 1 / (i + 1)).reduce((a, b) => a + b)
      bWeight = b.path.split('/').map((y, i) => y == '*' ? 0 : 1 / (i + 1)).reduce((a, b) => a + b)
      return bWeight - aWeight;
    });
  }
}

module.exports = Item;
