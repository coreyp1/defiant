"use strict";

const FormInstance = require('../../formApi/formInstance');
const merge = require('../../../util/merge');

/**
 * Provide an instance of a form for editing a specific Entity.
 * @class
 * @extends Defiant.Plugin.FormApi.FormInstance
 * @memberOf Defiant.Plugin.Orm
 */
class EntityEditFormInstance extends FormInstance {
  /**
   * In all FormInstance derivatives, super.init() should be called LAST!
   * Otherwise, the [Static]{@link Defiant.Plugin.FormApi.Static} and
   * [Encrypt]{@link Defiant.Plugin.FormApi.Encrypt} elements will not work
   * properly.
   *
   * When this function is finished, then the form should be ready to
   * be rendered as a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
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

      // Add an empty attribute array to the entity if needed.  This will
      // be necessary if we are creating a new entity.
      if (this.buildState.entity[Attribute.attributeName] === undefined) {
        this.buildState.entity[Attribute.attributeName] = [];
      }

      if (Attribute.formType == 'individual') {
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
      else if (Attribute.formType == 'group') {
        // The Attribute is responsible for handling the individual entries.
        let elementInstance = Element.newInstance(this.context, {
          name: `${elementGroup.name}`,
          attribute: this.buildState.entity[Attribute.attributeName],
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

  /**
   * Perform the form validations.
   * @function
   * @async
   */
  async validate() {
    await super.validate();

    const Entity = this.renderable.Entity;

    for (let Attribute of Entity.attributeRegistry.getOrderedElements()) {
      let elementGroup = this.instanceRegistry.get(Attribute.attributeName);

      // Validate the form elements for this attribute.
      for (let elementInstance of elementGroup.instanceRegistry.getOrderedElements()) {
        await Attribute.formValidate(elementInstance);
      }
    }
  }

  /**
   * Perform the form submission.
   * @function
   * @async
   */
  async submit() {
    await super.submit();

    const Entity = this.renderable.Entity;

    for (let Attribute of Entity.attributeRegistry.getOrderedElements()) {
      // Because we are using the same entity that was used to create the form
      // (which was stored in the buildState), we know that the order below
      // will also be the same for validation and submission purposes.
      let elementGroup = this.instanceRegistry.get(Attribute.attributeName);

      // Submit the form elements for this attribute.
      for (let elementInstance of elementGroup.instanceRegistry.getOrderedElements()) {
        await Attribute.formSubmit(elementInstance);

        // If the attribute is empty, it should be removed from the Entity.
        if (await Attribute.valueIsEmpty(elementInstance.attribute)) {
          let attr = this.buildState.entity[Attribute.attributeName];
          let index = attr.indexOf(elementInstance.attribute, 1);
          if (index > -1) {
            attr.splice();
          }
        }
      }
    }

    // Save the entity.
    await Entity.save(this.buildState.entity);

    // Delete the POST values.
    delete this.context.post[this.id];
  }
}

module.exports = EntityEditFormInstance;
