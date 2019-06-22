"use strict";

const FormInstance = require('../../formApi/formInstance');
const merge = require('../../../util/merge');

class EntityEditFormInstance extends FormInstance {
  async init(data={}) {
    const FormApi = this.context.engine.pluginRegistry.get('FormApi');
    const Element = FormApi.getElement('Element');
    const Button = FormApi.getElement('Button');
    const Entity = this.renderable.Entity;

    // Add the Entity Attribute fields.
    for (let Attribute of Entity.attributeRegistry.getOrderedElements()) {
      let delta = 0;

      // Add a form element for each of the existing values.
      for (let attribute of this.buildState.entity[Attribute.attributeName]) {
        let elementInstance = Element.newInstance(this.context, {name: `${Attribute.attributeName}[${delta}]`});
        await Attribute.formInit(this, elementInstance, merge({delta}, attribute));
        this.addInstance(elementInstance);
        ++delta;
      }

      // Add a form element for each "missing" (empty) value.
      for (let i = delta; i < Attribute.data.count; ++i) {
        let elementInstance = Element.newInstance(this.context, {name: `${Attribute.attributeName}[${i}]`});
        await Attribute.formInit(this, elementInstance, {delta: i});
        this.addInstance(elementInstance);
      }
    }

    // Add the buttons.
    this.addInstance(Button.newInstance(this.context, {
      name: 'update',
      data: {
        value: 'update',
        content: 'Update',
      },
    }));
    this.addInstance(Button.newInstance(this.context, {
      name: 'update2',
      data: {
        value: 'update222',
        content: 'Update2',
      },
    }));

    await super.init(data);
  }
}

module.exports = EntityEditFormInstance;
