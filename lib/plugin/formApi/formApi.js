"use strict";

const Plugin = require('../plugin');
const InitRegistry = require('../../util/initRegistry');
const FileTable = require('../fileApi/table/fileTable');
const Element = require('./element');

/**
 * The FormApi handles the secure processing of forms.  It is important to read
 * and understand the flow of form processing if you are trying to write code
 * that interacts with the FormApi.
 *
 * In order to process forms securely, all forms are cryptographically signed
 * with a few important pieces of information: The circumstances under which the
 * form was built (stored cryptographically in the
 * [buildstate]{@link Defiant.Plugin.FormApi.FormInstance#buildState}) and form
 * validation information, which is cryptographically signed to prevent
 * tampering.
 *
 * All encryption and cryptographic signing makes use of a streaming cipher
 * with a nonce and a hidden key unique to that session, stored server-side.
 *
 * The secure processing of a form is complicated.  Most people want to begin
 * with the creation of a form, but Defiant must be a bit more sophisticated.
 * Defiant's form handling is as follows:
 *
 * <ol><li>When a request is accepted, it is checked for a form submission.
 * <ol><li>If there is a form submission, then it is checked for valid
 * `buildState` and `validate` elements.</li>
 * <li>If this check fails, then an error message is queued for display.</li>
 * <li>If the check passed, then the original form is reconstructed from the
 * `buildState` information and is used to validate the rest of the form
 * submission.
 * <ol><li>If the form validation fails, the error messages are queued for
 * display.</li>
 * <li>If the form validation passes, then the form submission handlers are
 * executed. A redirect may be triggered upon successful form submission.</ol>
 * <li>The Router passes control to the next Handler, and the request continues
 * to be processed.</li></ol></li>
 * <li>If the current page is displaying a form, then that form will be built
 * from scratch.  Note that there may be multiple forms on the same page.
 * <ol><li>When building a form, the form will specify the default values for
 * the form elements.</li>
 * <li>If the form being built has the same id as a form which was submitted
 * (the submission having been processed in step #1), then the submitted values
 * will be shown rather than the default values.  This provides expected
 * behavior such as the form retaining submitted values when there was an
 * error.</li>
 * <li>In the rendering, if any form elements were marked as being in an error
 * state during the previous form validation, then mark those form
 * elements.</li></ol></li></ol>
 *
 * All plugins must declare their forms and form elements to the FormApi plugin
 * so that forms and form elements can be accessed by other plugins.
 *
 * See the [Form]{@link Defiant.Plugin.FormApi.Form} class for information about
 * the structure of an individual form and how to alter and extend them.
 *
 * See the [Element]{@link Defiant.Plugin.FormApi.Element} class for information
 * about form elements, including how to alter and extend them.
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Plugin
 */
class FormApi extends Plugin {
  /**
   * @function
   * @async
   * @param {Defiant.Plugin} plugin
   *   The Plugin to which the `action` pertains.
   * @param {String} action
   *   The action being performed.  Example actions include "pre-enable",
   *   "enable", "disable", "update".
   * @param {Mixed} [data=NULL]
   *   Any supplementary information.
   */
  async notify(plugin, action, data=null) {
    super.notify(plugin, action, data);
    switch (action) {
      case 'pre:enable':
        /**
         * @member {Defiant.util.InitRegistry} Defiant.Plugin.FormApi#formRegistry
         *   A registry of forms provided by various plugins.
         */
        this.formRegistry = new InitRegistry({}, [this.engine]);

        /**
         * @member {Defiant.util.InitRegistry} Defiant.Plugin.FormApi#elementRegistry
         *   A registry of form elements provided by various plugins.
         */
        this.elementRegistry = new InitRegistry({}, [this.engine]);

        // Register FormApi form elements
        this
          .setElement(new Element(this.engine))
          .setElement(new Element(this.engine, {
            id: 'GenericRenderable',
            Instance: require('./element/genericRenderableInstance'),
          }))
          .setElement(new Element(this.engine, {
            id: 'Hidden',
            Instance: require('./element/hiddenInstance'),
          }))
          .setElement(new Element(this.engine, {
            id: 'Encrypt',
            Instance: require('./element/encryptInstance'),
          }))
          .setElement(new Element(this.engine, {
            id: 'Static',
            Instance: require('./element/staticInstance'),
          }))
          .setElement(new Element(this.engine, {
            id: 'FormValidate',
            Instance: require('./element/formValidateInstance'),
          }))
          .setElement(new Element(this.engine, {
            id: 'Button',
            template: 'TagPair',
            Instance: require('./element/buttonInstance'),
          }))
          .setElement(new Element(this.engine, {
            id: 'Password',
            Instance: require('./element/passwordInstance'),
          }))
          .setElement(new Element(this.engine, {
            id: 'Text',
            Instance: require('./element/textInstance'),
          }))
          .setElement(new Element(this.engine, {
            id: 'Textarea',
            Instance: require('./element/textareaInstance'),
          }))
          .setElement(new Element(this.engine, {
            id: 'Checkbox',
            Instance: require('./element/checkboxInstance')
          }))
          .setElement(new Element(this.engine, {
            id: 'Checkboxes',
            Instance: require('./element/checkboxesInstance')
          }))
          .setElement(new Element(this.engine, {
            id: 'Radios',
            Instance: require('./element/radiosInstance'),
          }))
          .setElement(new Element(this.engine, {
            id: 'Select',
            Instance: require('./element/selectInstance'),
          }))
          .setElement(new Element(this.engine, {
            id: 'Fieldset',
            Instance: require('./element/fieldsetInstance'),
          }))
          .setElement(new Element(this.engine, {
            id: 'File',
            Instance: require('./element/fileInstance'),
          }))
          .setElement(new Element(this.engine, {
            id: 'Stream',
            Instance: require('./element/streamInstance'),
          }));

        for (let existingPlugin of ['Router', 'Orm'].map(name => this.engine.pluginRegistry.get(name))) {
          if (existingPlugin instanceof Plugin) {
            await this.notify(existingPlugin, 'enable');
          }
        }
        break; // pre:enable

      case 'enable':
        switch ((plugin || {}).id) {
          case 'Router':
            // Process incoming Http requests for form elements
            plugin
              .addHandler(new (require('./handler/formApiHandler'))());
            break; // Router

          case 'Orm':
            // Declare the File Upload Table.
            let fileUploadTable = new FileTable(this.engine, 'fileUpload', {});
            plugin
              .entityRegistry.set(fileUploadTable);
            break; // Orm
        }
        break; // enable

      case 'pre:disable':
        // @todo: Remove Router and Orm integrations.
        break; // pre:disable
    }
  }

  /**
   * Add a form to the form registry.
   * @function
   * @param {Defiant.Plugin.FormApi.Form} form
   *   The form to add to the registry.
   * @return {Defiant.Plugin.FormApi}
   *   The FormApi instance.
   */
  setForm(form) {
    this.formRegistry.set(form);
    return this;
  }

  /**
   * Get a form from the form registry.
   * @function
   * @param {String} formId
   *   The id of the form to fetch from the registry.
   * @return {Defiant.Plugin.FormApi.Form}
   *   The requested form.
   * @throws Will throw if `formId` is not registered.
   */
  getForm(formId) {
    let form = this.formRegistry.get(formId);
    if (!form) {
      throw 'Unregistered form: ' + formId;
    }
    return form;
  }

  /**
   * Add an element to the element registry.
   * @function
   * @param {Defiant.Plugin.FormApi.Element} element
   *   The element to add to the registry.
   * @return {Defiant.Plugin.FormApi}
   *   The FormApi instance.
   */
  setElement(element) {
    this.elementRegistry.set(element);
    return this;
  }

  /**
   * Get an element from the element registry.
   * @function
   * @param {String} elementId
   *   The id of the element to fetch from the registry.
   * @return {Defiant.Plugin.FormApi.Element}
   *   The requested element.
   * @throws Will throw if `elementId` is not registered.
   */
  getElement(elementId) {
    let element = this.elementRegistry.get(elementId);
    if (!element) {
      throw 'Unregistered form element: ' + elementId;
    }
    return element;
  }


  /**
   * Set an error on the form and send a message in the response.
   * @param {Defiant.Context} context
   *   The request context.
   * @param {String} formId
   *   The id of the form on which to set the error.
   * @param {String} elementName
   *   The name of the element within the form on which to flag the error.
   * @param {String} message
   *   The error message to send in the response.
   */
  setError(context, formId, elementName, message) {
    context.formApiError = true;
    context.volatile.message.set(elementName, message, 'danger');
    context.formApiErrorList.formId.add(elementName);
  }
}

module.exports = FormApi;
