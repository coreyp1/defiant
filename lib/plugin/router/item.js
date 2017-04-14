"use strict";

const Registry = require('../../util/registry');

class Item {
  constructor(depth = 0) {
    this.handlers = new Registry();
    this.subquery = new Map();
    this.depth = depth;
    return this;
  }

  addHandler(handler) {
    let path = handler.path.split('/').slice(this.depth, this.depth + 1)[0] || '';
    if (path == '') {
      this.handlers.set(handler);
    }
    else {
      if (!this.subquery.has(path)) {
        this.subquery.set(path, new Item(this.depth + 1));
      }
      this.subquery.get(path).addHandler(handler);
    }
    return this;
  }

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
    handlers.push(...Array.from(this.handlers.getIterator()));
    return handlers;
  }

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
