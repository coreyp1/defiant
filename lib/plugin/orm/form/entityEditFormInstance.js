"use strict";

const FormInstance = require('../../formApi/formInstance');
const merge = require('../../../util/merge');

class EntityEditFormInstance extends FormInstance {
  async init(data={}) {
    const FormApi = this.context.engine.pluginRegistry.get('FormApi');
    const Element = FormApi.getElement('Element');
    const Button = FormApi.getElement('Button');
    const Entity = this.renderable.Entity;

    for (let Attribute of Entity.attributeRegistry.getOrderedElements()) {
      let delta = 0;
      let maxWeight = 0;
      let elementGroup = Element.newInstance(this.context, {name: Attribute.attributeName});
      this.addInstance(elementGroup);

      // Add a form element for each of the existing values.
      for (let attribute of this.buildState.entity[Attribute.attributeName]) {
        let elementInstance = Element.newInstance(this.context, {
          name: `${elementGroup.name}[${delta}]`,
          attribute: merge(attribute, {delta}),
        });
        elementGroup.addInstance(elementInstance);
        await Attribute.formInit(elementInstance);
        maxWeight = Math.max(maxWeight, parseFloat(attribute.weight || 0));
        ++delta;
      }

      // Add a form element for each "missing" (empty) value.
      for (let i = delta; i < Attribute.data.count; ++i) {
        maxWeight += 1;
        let attribute = {delta: i, weight: maxWeight}
        this.buildState.entity[Attribute.attributeName].push(attribute);
        let elementInstance = Element.newInstance(this.context, {
          name: `${elementGroup.name}[${i}]`,
          attribute,
        });
        elementGroup.addInstance(elementInstance);
        await Attribute.formInit(elementInstance);
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

  async validate() {
    await super.validate();

    const Entity = this.renderable.Entity;
    const post = this.context.post[this.id];

    for (let Attribute of Entity.attributeRegistry.getOrderedElements()) {
      // Because we are using the same entity that was used to create the form
      // (which was stored in the buildState), we know that the order below
      // will also be the same for validation and submission purposes.
      let elementGroup = this.instanceRegistry.get(Attribute.attributeName);

      // Validate the form elements for this attribute.
      for (let elementInstance of elementGroup.instanceRegistry.getOrderedElements()) {
        await Attribute.formValidate(elementInstance);
      }
    }
  }

  async submit() {
    await super.submit();

    const Entity = this.renderable.Entity;
    const post = this.context.post[this.id];

    for (let Attribute of Entity.attributeRegistry.getOrderedElements()) {
      // Because we are using the same entity that was used to create the form
      // (which was stored in the buildState), we know that the order below
      // will also be the same for validation and submission purposes.
      let elementGroup = this.instanceRegistry.get(Attribute.attributeName);

      // Submit the form elements for this attribute.
      for (let elementInstance of elementGroup.instanceRegistry.getOrderedElements()) {
        await Attribute.formSubmit(elementInstance);
      }
    }

    // Lastly, save the entity.
    //
  }
}

module.exports = EntityEditFormInstance;
