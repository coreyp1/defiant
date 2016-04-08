'use strict';

class Registry {
  constructor({useWeight, useId} = {useWeight: 'weight', useId: 'id'}) {
    // Ugly shim until parameter destructuring (with defaults) fully works.
    useWeight = useWeight || 'weight';
    useId = useId || 'id';
    this.data = new Map();
    this.counter = 0;
    this.order = new Map();
    this.orderedKeysCache = undefined;
    this.useWeight = useWeight;
    this.useId = useId;
    return this;
  }

  set(obj) {
    let id = obj[this.useId];
    this.data.set(id, obj);
    this.order.set(id, this.counter++);
    this.orderedKeysCache = undefined;
    return this;
  }

  get(id) {
    return this.data.get(id);
  }

  getOrderedKeys() {
    if (this.orderedKeysCache == undefined) {
      this.orderedKeysCache = Array.from(this.data.keys()).sort((a, b) => {
        let aWeight = this.data.get(a)[this.useWeight] || 0;
        let bWeight = this.data.get(b)[this.useWeight] || 0;
        if (aWeight != bWeight) {
          return aWeight - bWeight;
        }
        return this.order.get(a) - this.order.get(b);
      });
    }
    return this.orderedKeysCache;
  }

  getOrderedElements() {
    return this.getOrderedKeys().map(id => this.data.get(id));
  }

  getIterator() {
    return this.data.values();
  }
}

module.exports = Registry;
