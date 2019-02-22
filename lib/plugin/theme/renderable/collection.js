"use strict";

const Renderable = require('./renderable');

class Collection extends Renderable {}

Collection.Instance = require('./collectionInstance');
/*
const Registry = require('../../../util/registry');

class Collection extends Renderable {
  addElement(data, element) {
    if (!data.elementRegistry) {
      data.elementRegistry = new Registry({useId: 'name'});
    }
    data.elementRegistry.set(element);
    element.parent = data;
    return this;
  }

  async init(context, data={}) {
    const FormApi = this.engine.pluginRegistry.get('FormApi');
    data = await super.init(context, data);
    let replacementRegistry = new Registry({useId: 'name'});
    if (data.elementRegistry) {
      for (let element of data.elementRegistry.getOrderedElements()) {
        const Element = context.theme.getRenderable(element.type)
          || FormApi.getElement(element.type);
        replacementRegistry.set(await Element.init(context, element));
      }
      data.elementRegistry = replacementRegistry;
    }
    return data;
  }

  async commit(data) {
    const FormApi = this.engine.pluginRegistry.get('FormApi');
    return data.elementRegistry
      ? (await Promise.all(data.elementRegistry.getOrderedElements()
        .map(async (item) => {
          const Element = data.context.theme.getRenderable(item.type)
            || FormApi.getElement(item.type);
          return await Element.commit(item)
        })))
        .join('')
      : '';
  }

  *getAllElementsRecursive(data) {
    // NOTE: Intentionally leaving this as a generator.
    if (data && data.elementRegistry) {
      for (let element of data.elementRegistry.getOrderedElements()) {
        yield element;
        yield* this.getAllElementsRecursive(element.data);
      }
    }
  }
}
*/

module.exports = Collection;
