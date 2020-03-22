"use strict";

const CollectionInstance = require('../theme/renderable/collectionInstance');
const Redirect = require('../http/response/redirect');
const crypto = require('crypto');
const uuid = require('node-uuid');

/**
 * When instantiated, it represents a specific representation of a form.
 * @class
 * @extends Defiant.Plugin.Theme.CollectionInstance
 * @memberOf Defiant.Plugin.FormApi
 */
class FormInstance extends CollectionInstance {
  /**
   * @constructor
   * @param {Defiant.Plugin.FormApi.Form} renderable
   *   The Form that this is an instance of.
   * @param {Object} setup
   *   The configuration object.
   * @param {Defiant.Context} context
   *   The request context.
   * @returns {Defiant.Plugin.FormApi.FormInstance}
   *   The instantiation of the FormInstance.
   */
  constructor(renderable, setup, context) {
    super(renderable, setup, context);
    this.id = this.id || this.renderable.id;

    // Set up default data members.
    /**
     * @member {Object} Defiant.Plugin.FormApi.FormInstance#buildState
     *   The circumstances under which the form is being built.  This
     *   information will be included with the form in an encrypted state.
     */
    this.buildState = setup.buildState || {};

    /**
     * @member {String} Defiant.Plugin.FormApi.FormApi#ivBase
     *   The Initialization Vector to be used as part of a nonce for some
     *   cryptographic operation.
     *
     *   The ivBase can be given to the client, as long as the hidden key is
     *   kept hidden and unique to the session.
     */
    this.ivBase = setup.ivBase || uuid.v4();

    /**
     * @member {number} Defiant.Plugin.FormApi.FormInstance#ivCounter
     *   A counter to append to the ivBase, to be used as a nonce for some
     *   cryptographic operation.
     */
    this.ivCounter = 0;

    [
      /**
       * @member {String} Defiant.Plugin.FormApi.FormInstance#redirect
       *   The path that the form should be redirected to upon successful
       *   submission.
       */
      'redirect',
    ].map(key => this[key] = setup[key] ? setup[key] : this.constructor[key]);
  }

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
    const Encrypt = FormApi.getElement('Encrypt');
    const Static = FormApi.getElement('Static');
    const FormValidate = FormApi.getElement('FormValidate');

    // Remove unnecessary information, if present.
    delete this.buildState.validate;
    delete this.buildState.buildState;

    // Add buildState.
    this.addInstance(Encrypt.newInstance(this.context, {
      name: 'buildState',
      weight: -989,
      data: {
        verifyIncluded: true,
        value: JSON.stringify(this.buildState),
      },
    }));

    // Runs init for all elements.  The important thing in this step is that
    // it causes the cryptographic signing to happen for all encrypt and
    // static elements.
    await super.init(data);

    // Compile the data from encrypt and static element for inclusion in the
    // validate element.
    let encrypt = {e: {}, v: []};
    for (let element of this.getAllElementsRecursive()) {
      if ((element instanceof Encrypt.Instance) || (element instanceof Static.Instance)) {
        encrypt.e[element.name] = {c: element.ivCounter, t: element.encrypted.tag};
      }
      if (element.data && element.data.verifyIncluded) {
        encrypt.v.push(element.name);
      }
    }

    // Finally, add the validate element, and call its init (which was left
    // out of the super.init).
    let formValidate = FormValidate.newInstance(this.context, {
      name: 'validate',
      weight: -999,
      data: {
        encrypt,
        static: [this.renderable.id, this.ivBase],
        ivCounter: this.ivCounter,
      },
    });
    this.addInstance(formValidate);
    await formValidate.init();
  }

  /**
   * Take all data that was passed in via the constructor as well as any work
   * done by the [init()]{@link Defiant.Plugin.FormApi.FormInstance#init},
   * and compile it using the
   * [Renderable.templateFunction]{@link Defiant.Plugin.Theme.Renderable#templateFunction}.
   * @todo This isn't using the values in `instanceSetup`!!!  Fix me!!!
   * @function
   * @async
   * @returns {String}
   *   The final string that should be provided to the user.
   */
  async commit() {
    const TagPair = this.context.theme.getRenderable('TagPair');
    let tagPairInstance = TagPair.newInstance(this.context);
    await tagPairInstance.init({
      tag: 'form',
      attributes: {
        method: 'post',
        action: '',
        enctype: 'multipart/form-data',
        'accept-charset': 'UTF-8',
        autocomplete: 'on', //HTML 5
        name: this.renderable.id,
        id: new Set([this.renderable.id]),
        novalidate: false, //HTML 5 - 'novalidate'
      },
      content: await super.commit(),
    });
    return await tagPairInstance.commit();
  }

  /**
   * Perform the form validations.
   * @todo Add validations from other plugins.
   * @function
   * @async
   */
  async validate() {
    // TODO: add form validate
    // In the event of an error, set context.formApiError = true;
    for (let instance of this.instanceRegistry.getIterator()) {
      if (instance.validate) {
        await instance.validate();
      }
    }
  }

  /**
   * Perform the form submission.
   * @todo Add submissions from other plugins.
   * @function
   * @async
   */
  async submit() {
    for (let instance of this.instanceRegistry.getIterator()) {
      if (instance.submit) {
        await instance.submit();
      }
    }
    // Set a redirect if no other httpResponse has yet been set.
    if (this.redirect && !this.context.httpResponse) {
      this.context.httpResponse = new Redirect(this.context, 303, this.redirect);
    }
  }

  /**
   * Set an error on the form.
   * @function
   * @param {String} elementName
   *   The name of the element that should show the error state.
   * @param {String} message
   *   The error message to display.
   */
  setError(elementName, message) {
    this.validationError = true;
    this.context.engine.pluginRegistry.get('FormApi').setError(this.context, this.renderable.id, elementName, message);
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
    if (instance && instance.setFormInstance) {
      instance.setFormInstance(this);
    }
    return super.addInstance(instance);
  }

  /**
   * Perform a "sha256" hash on `plaintext` and retrieve it encoded in base64.
   * @function
   * @static
   * @param {String} plaintext
   *   The text on which to perform the hash.
   * @returns {String}
   *   A base64 encoding of the hashed plaintext.
   */
  static hash(plaintext) {
    let shasum = crypto.createHash('sha256');
    shasum.update(plaintext);
    return shasum.digest('base64');
  }

  /**
   * Get an initialization vector based on the
   * [ivBase]{@link Defiant.Plugin.FormApi.FormInstance#ivBase} and the provided
   * `slug`.
   * @function
   * @param {String} slug
   *   The text to be combined with the form instance's `ivBase`.
   * @returns {String}
   *   The resultant initialization vector.
   */
  getIV(slug) {
    return this.hash(this.ivBase + slug.toString()).substring(0,12);
  }

  /**
   * Get a unique counter value for this form instance, to be used in a nonce.
   * @function
   * @returns {number}
   *   A unique counter value.
   */
  getNextIVCounter() {
    return this.ivCounter++;
  }
}

module.exports = FormInstance;
