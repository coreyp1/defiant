'use strict';

/**
 * Create a Defiant Registry object.
 *
 * A Registry is a container for objects.  The registry has two special
 * properties:
 * <ol><li>Each object in the Registry is uniquely identifiable by some `id`
 * and each object in the Registry has a `weight`.</li><li>The Registry tracks
 * the order in which objects are inserted.</li></ol>
 *
 * When asked, the Registry can return a sorted array of the Objects ordered by
 * weight then by insertion order.  "Lighter" (i.e., smaller value) weights rise
 * to the top.  Heavier (i.e., larger value) weights sink to the bottom.
 *
 * Registries are the backbone for many parts of Defiant, serving as general
 * purpose containers for various types of plugins in which weighted ordering is
 * important.
 * @class
 * @memberOf Defiant.util
 */
class Registry {
  /**
   * @constructor
   * @prop {Object} config Configuration options for this Registry.
   * @prop {String} [config.useWeight="weight"] For each object inserted, this
   *   will be the key of the object that is used to determine the object's
   *   weight.
   * @prop {String} [config.useId="id"] For each object inserted, this will be the
   *   key that is used to determine the object's unique id.
   * @returns {Defiant.util.Registry} The Registry object that was created.
   */
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

  /**
   * Add the object `obj` into the Registry.
   *
   * If another object exists with the same id, then that object will be
   * replaced by `obj`.
   * @param {Object} obj The object to insert into the Registry.
   * @returns {Defiant.util.Registry} The Registry object.
   */
  set(obj) {
    let id = obj[this.useId];
    this.data.set(id, obj);
    this.order.set(id, this.counter++);
    this.orderedKeysCache = undefined;
    return this;
  }

  /**
   * Get the object from the Registry identified by `id`.
   * @param {String} id The `id` of the object to retrieve from the Registry.
   * @returns {Object} The object whose id matches `id`.
   */
  get(id) {
    return this.data.get(id);
  }

  /**
   * Return an array of ids from the objects in the Registry ordered first by
   * weight, then by insertion order.
   * @returns {String[]} An ordered array of all ids in the Registry.
   */
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

  /**
   * Return an array of all objects from the Registry ordered first by weight,
   * then by insertion order.
   * @returns {Object[]} An ordered array of all objects in the Registry.
   */
  getOrderedElements() {
    return this.getOrderedKeys().map(id => this.data.get(id));
  }

  /**
   * Return an iterator for all objects in the Registry, in insertion order.
   *
   * NOTE: This ignores weight.
   *
   * TODO: This should incorporate weight!
   * @returns {Iterator}  Iterator for all objects in the Registry.
   */
  getIterator() {
    return this.data.values();
  }
}

module.exports = Registry;
