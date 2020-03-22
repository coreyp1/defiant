"use strict";

const Collection = require('../theme/renderable/collection');
const Registry = require('../../util/registry');
const merge = require('../../util/merge');

/**
 * The Form class is a type of
 * [Renderable]{@link Defiant.Plugin.Theme.Renderable}, and therefore must have
 * a class definition (of which Form is the base class) and an Instance (of
 * which [FormInstance]{@link Defiant.Plugin.FormApi.FormInstance} is the base
 * class).
 *
 * Like Renderables, Forms are added to the
 * [form registry]{@link Defiant.Plugin.FormApi#formRegistry} in their
 * instantiated form (not to be confused with the FormInstance, which is
 * needed later).  The advantage to this approach (similar to the reasoning in
 * the case of Renderables in general) is that one class defintion can serve
 * to provide multiple forms, which can be generated programmatically.  An
 * example is the [Entity]{@link Defiant.Plugin.Orm.Entity} which must provide
 * a type of edit form for each type of Entity.
 *
 * Like Renderables, when a Form needs to be presented to the user, it must have
 * a FormInstance which is instantiated for the display of that particular form.
 * To use the previous example of the Entity, there may be multiple Entity edit
 * forms generated for the same page request, and each must have information
 * particular to that specific instance (e.g, the id of the Entity being
 * edited).
 *
 * Each Form in the formRegistry has a unique id.  Any plugin can access the
 * Forms in the formRegistry using this unique id and modify the form data.
 * Common modifications include adding validation functions and submit
 * functions.
 *
 * @todo Flesh out validation and submission routines from the registries.
 * @class
 * @extends Defiant.Plugin.Theme.Collection
 * @memberOf Defiant.Plugin.FormApi
 */
class Form extends Collection {
  /**
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @param {Object} [setup={}]
   *   The setup options.
   * @param {Object} [setup.instanceSetup={}]
   *   Setup options which will be passed to the
   *   [FormInstance]{@link Defiant.Plugin.FormApi.FormInstance} when it is
   *   instantiated.
   * @param {Object} [setup.instanceSetup.data={}]
   *   The data object to pass to the FormInstance setup.
   * @param {String} [setup.instanceSetup.data.tag="form"]
   *   The tag for the form HTML.
   * @param {Object} [setup.instanceSetup.data.attributes={}]
   *   The attributes of the tag as key/value pairs.  The value may be a Set.
   *
   *   Of course, any valid
   *   [html form attribute]{@link https://www.w3schools.com/tags/tag_form.asp}
   *   is acceptable.
   * @param {Object} [setup.instanceSetup.data.attributes.id=Set<String>]
   *   Ids that will appear in the form tag.
   * @param {Object} [setup.instanceSetup.data.attributes.class=Set<String>]
   *   Classes that will appear in the form tag.
   * @param {Object} [setup.instanceSetup.data.attributes.method="post"]
   *   How the form should be submitted. `get` or `post`.
   * @param {Object} [setup.instanceSetup.data.attributes.action=""]
   *   Where the form should be submitted.  Defaults to the current page.
   * @param {Object} [setup.instanceSetup.data.attributes.enctype="multipart/form-data"]
   *   How the form data will be encoded.
   * @param {Object} [setup.instanceSetup.data.attributes.accept-charset="UTF-8"]
   *   The character set that should be used in the form submission.
   * @param {Object} [setup.instanceSetup.data.attributes.autocomplete="on"]
   *   Allow the brower to autocomplete for the user.
   * @param {Object} [setup.instanceSetup.data.attributes.novalidate="false"]
   *   Whether or not the browser should validate the data.  As a general rule,
   *   Defiant should never trust the browser, and therefore should always
   *   validate user input, regardless of this setting.
   * @param {Object} [setup.instanceSetup.data.redirect=undefined]
   *   Where the form should be redirected to upon successful submission.
   * @returns {Defiant.Plugin.FormApi.Form}
   *   The instantiated Form.
   */
  constructor(engine, setup={}) {
    super(engine, merge({
      instanceSetup: {
        data: {
          tag: 'form',
          attributes: {
            id: new Set(),
            class: new Set(),
            method: 'post',
            action: '',
            enctype: 'multipart/form-data',
            'accept-charset': 'UTF-8',
            autocomplete: 'on', //HTML 5
            novalidate: false, //HTML 5 - 'novalidate'
          },
          redirect: undefined,
        },
      },
    }, setup));

    // Add the form name as an id to the form attributes.
    let idata = this.instanceSetup.data;
    if (idata.attributes && idata.attributes.id && idata.attributes.id.add) {
      idata.attributes.id.add(this.name);
    }

    /**
     * @member {Defiant.util.Registry} Defiant.Plugin.FormApi.Form#validateRegistry
     *   A Registry of validation functions that should be applied to any form
     *   of this type.
     */
    this.validateRegistry = new Registry();

    /**
     * @member {Defiant.util.Registry} Defiant.Plugin.FormApi.Form#submitRegistry
     *   A Registry of submit functions that should be applied to any form of
     *   this type upon successful validation.
     */
    this.submitRegistry = new Registry();
  }
}

Form.Instance = require('./formInstance');
module.exports = Form;
