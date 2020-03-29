"use strict";

const Handler = require('../../router/handler');
const Themed = require('../../http/response/themed');

/**
 * Provide an Entity deletion form.  This handler is specific to an individual
 * Entity type.
 * @class
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.Orm
 */
class EntityDeleteHandler extends Handler {
  /**
   * For additional options to pass in to `data`, see
   * [Handler]{@link Defiant.Plugin.Router.Handler}.
   * @constructor
   * @param {Object} data
   *   The Handler settings.
   * @param {String} form
   *   The id of the form to associate with this entity deletion handler.
   * @returns {Defiant.Plugin.Orm.EntityDeleteHandler}
   *   The instantiated EntityDeleteHandler.
   */
  constructor(data={}) {
    super(data);
    [
      /**
       * @member {String} Defiant.Plugin.Orm.EntityDeleteHandler#form
       *   The id of the form to associate with this entity deletion handler.
       */
      'form',
    ].map(val => this[val] = data[val] ? data[val] : (this[val] ? this[val] : this.constructor[val]));
    this.data = data;
  }

  /**
   * A request has been made.  Process the request and provide the necessary
   * [Renderable]{@link Defiant.Plugin.Theme.Renderable}.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
    await super.init(context);

    const FormApi = context.engine.pluginRegistry.get('FormApi');
    const Form = FormApi.getForm(this.data.form);
    const uuid = context.request.urlTokenized[1];
    const entity = await Form.Entity.load({uuid});
    const instance = Form.newInstance(context, {buildState: {entity}});
    await instance.init();
    context.httpResponse = new Themed(context, {
      language: 'us',
      siteName: 'Defiant',
      head: '',
      jsFooter: '',
      content: await instance.commit(),
    });
  }
}

module.exports = EntityDeleteHandler;
