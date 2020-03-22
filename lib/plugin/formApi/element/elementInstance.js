"use strict";

const RenderableInstance = require('../../theme/renderable/renderableInstance');
const CollectionInstance = require('../../theme/renderable/collectionInstance');
const Registry = require('../../../util/registry');

/**
 * Instance of an element.  Each instantiation represents an individual form
 * element.
 * @class
 * @extends CollectionInstance
 * @memberOf Defiant.Plugin.FormApi
 */
class ElementInstance extends CollectionInstance {
  /**
   * @constructor
   * @param {Defiant.Plugin.FormApi.Element} renderable
   *   The Element that this is an instance of.
   * @param {Object} setup
   *   The configuration object.
   * @param {Defiant.Context} context
   *   The request context.
   * @returns {Defiant.Plugin.FormApi.ElementInstance}
   *   The instantiation of the ElementInstance.
   */
  constructor(renderable, setup, context) {
    super(renderable, setup, context);

    /**
     * @member {Defiant.Plugin.Theme.RenderableInstance} Defiant.Plugin.FormApi.ElementInstance#wrap
     *   A RenderableInstance to wrap this element with.  The output of this
     *   element will become the
     *   [content]{@link Defiant.Plugin.Theme.TagPair.Variables} of the wrapping
     *   tags.
     */
    this.wrap = this.wrap || setup.wrap || this.constructor.wrap || {};

    /**
     * @todo Shouldn't this be moved to the Element class?
     * @member {Defiant.util.Registry} Defiant.Plugin.FormApi.ElementInstance#validateRegistry
     *   A registry to hold validation functions.
     */
    this.validateRegistry = new Registry();

    /**
     * @todo Shouldn't this be moved to the ElementClass?
     * @member {Defiant.util.Registry} Defiant.Plugin.FormApi.ElementInstance#submitRegistry
     *   A registry to hold submission functions.
     */
    this.submitRegistry = new Registry();
  }

  /**
   * When this function is finished, then the form should be ready to
   * be rendered as a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
  async init(data={}) {
    const TagPair = this.context.theme.getRenderable('TagPair');

    // Add a label, if required.
    if (this.data && this.data.label) {
      let label = TagPair.newInstance(this.context, {
        name: `label-${this.name}`,
        weight: -1,
        data: {
          tag: 'label',
          attributes: {
            for: this.name,
            class: new Set([this.name]),
          },
        },
      });
      label.data.content = this.data.label;
      if (this.data.required) {
        label.data.content += '<span class="form-required" aria-hidden="true">*</span>';
      }
      this.addInstance(label);
    }

    // Add a description, if required.
    if (this.data && this.data.description) {
      let description = TagPair.newInstance(this.context, {
        name: `description-${this.name}`,
        weight: 1,
        data: {
          tag: 'div',
          attributes: {
            class: new Set(['description', this.name]),
          },
        },
      });
      description.data.content = this.data.description;
      this.addInstance(description);
    }
    await super.init(data);
  }

  /**
   * Call the
   * [RenderableInstance.commit()]{@link Defiant.Plugin.Theme.RenderableInstance#commit}
   * for all renderable instances in this container and join them into a single
   * string.
   *
   * If a `wrap` RenderableInstance has been specified, then the string that was
   * joined together will now  become the `content` of that RenderableInstance.
   * @function
   * @async
   * @returns {String}
   *   The final string that should be provided to the user.
   */
  async commit() {
    if (this.wrap && (this.wrap instanceof RenderableInstance)) {
      await this.wrap.init({content: await super.commit()});
      return await this.wrap.commit();
    }
    return await super.commit();
  }

  /**
   * Add a RenderableInstance to the collection's registry.
   *
   * If the RenderableInstance knows about forms, then notify it that it has
   * been added to this form.
   * @function
   * @param {Defiant.Plugin.Theme.RenderableInstance} instance
   *   The renderable instance to add to the collection.
   * @returns {Defiant.Plugin.Theme.CollectionInstance}
   *   The current CollectionInstance.
   */
  addInstance(instance) {
    if (this.formInstance && instance && instance.setFormInstance) {
      instance.setFormInstance(this.formInstance);
    }
    return super.addInstance(instance);
  }

  /**
   * Notify the ElementInstance that it is being included in a FormInstance, and
   * pass that notification to any other form-aware child RenderableInstances.
   * @function
   * @param {Defiant.Plugin.FormApi.FormInstance} formInstance
   *   The formInstance that this element has been added to.
   */
  setFormInstance(formInstance) {
    this.formInstance = formInstance;
    this.instanceRegistry.getOrderedElements().map(e => ((e.form!== formInstance) && (typeof e.setFormInstance == 'function')) ? e.setFormInstance(formInstance) : null);
  }

  /**
   * Perform the form validations for this particular element and its child
   * elements.
   * @todo Add validations from other plugins.
   * @function
   * @async
   */
  async validate() {
    // Set error if required field is empty.
    let thisValue = this.formInstance ? this.context.post[this.formInstance.id][this.name] : undefined;
    if (this.data.required && !thisValue) {
      // Set a general error message (that won't be repeated multiple times).
      // TODO: Translate.
      this.formInstance.setError('requiredFieldEmpty', 'Please fill in the required fields.');
      // Set an empty error message, to highlight the field in the theme.
      this.formInstance.setError(this.name, '');
    }

    // TODO: Flesh this out.  We probably need to pass more information to the
    // validateFunction!
    for (let validateFunction of this.validateRegistry.getIterator()) {
      await validateFunction();
    }

    // Process sub-elements.
    for (let element of this.instanceRegistry.getIterator()) {
      if (element.validate) {
        await element.validate();
      }
    }
  }

  /**
   * Perform the form submission for this particular element and its child
   * elements.
   * @todo Add submissions from other plugins.
   * @function
   * @async
   */
  async submit() {
    // TODO: Flesh this out.  We probably need to pass more information to the
    // submitFunction!
    for (let submitFunction of this.submitRegistry.getIterator()) {
      await submitFunction();
    }

    for (let element of this.instanceRegistry.getIterator()) {
      if (element.submit) {
        await element.submit();
      }
    }
  }
}

module.exports = ElementInstance;
