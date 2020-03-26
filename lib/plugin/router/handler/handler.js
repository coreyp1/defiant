"use strict";

const Themed = require('../../http/response/themed');
const Renderable = require('../../theme/renderable');

/**
 * The Handler is the fundamental workhorse for fulfilling a page request.
 *
 * Plugins define Handlers which can modify the request context.  The app
 * [Router]{@link Defiant.Plugin.Router} decides which Handlers to execute based
 * on the path defined by each handler and the requested url.
 * @class
 * @memberOf Defiant.Plugin.Router
 */
class Handler {
  /**
   * @constructor
   * @param {Object} data The Handler settings.
   * @param {Defiant.Plugin.Router.Handler#id} data.id
   *   The unique id of the Handler.
   * @param {Defiant.Plugin.Router.Handler#weight} data.weight
   *   The weight of the Handler.
   * @param {Defiant.Plugin.Router.Handler#path} data.path
   *   The path that the Handler should match against.
   * @param {Defiant.Plugin.Router.Handler.alwaysProcess} data.alwaysProcess
   *   Give the request context to the handler even if another handler has
   *   already set the response body or code.
   * @param {Defiant.Plugin.Router.Handler.allowShowLink} data.allowShowLink
   *   Permit the link to be shown even if there is not an explicit `menu` set
   *   for it.
   * @param {Defiant.Plugin.Router.Handler#allowAccess} data.allowAccess
   *   The allowAccess decision function.
   * @param {Defiant.Plugin.Menu.HandlerMenu} data.menu
   *   The menu settings.
   * @param {Defiant.Plugin.Router.Handler#showLink} data.showLink
   *   The showLink decision function.
   * @returns {Defiant.Plugin.Router.Handler}
   *   The instantiated Handler.
   */
  constructor(data={}) {
    [
      /**
      * @member {String} Defiant.Plugin.Router.Handler#id
      *   The unique id of the Handler.
      */
      'id',
      /**
       * @member {number} Defiant.Plugin.Router.Handler#weight
       *   The weight of the Handler.
       */
      'weight',
      /**
       * @member {String} Defiant.Plugin.Router.Handler#path
       *   The path that the Handler should match against.
       */
      'path',
      /**
       * @member {Defiant.Plugin.Menu.HandlerMenu} Defiant.Plugin.Router.Handler#menu
       *   The menu settings.
       */
      'menu',
      // The remaining entries are documented elsewhere in this file.
      'alwaysProcess',
      'allowShowLink',
      'allowAccess',
      'showLink',
      'renderable',
    ].map(val => this[val] = data[val] ? data[val] : (this[val] ? this[val] : this.constructor[val]));
    /**
     * @member {Defiant.Plugin.Router.Handler.HandlerData} Defaint.Plugin.Router.Handler#data
     *   The settings for this particular handler.
     */
    this.data = data;
  }

  /**
   * Determine whether or not this handler will allow access to the url in
   * [context.request]{@link Defiant.Context#request}.  May also set
   * [context.httpResponse]{@link Defiant.Context#httpResponse}.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   **/
  async allowAccess(context) {
    return true;
  }

  /**
   * Choose whether or not to "vouch" for a link.  The path provided is usually
   * about to be shown in a menu listing, so this function is a test of whether
   * or not it should actually be displayed.  It will usually piggyback
   * functionality from the allowAccess() function, but must not allow
   * httpResponse to be altered.
   * @function
   * @async
   * @param {String} path
   *   The path that we are being asked to vouch for.
   * @param {Defiant.Context} context
   *   The request context.
   * @returns {boolean}
   *   Whether or not the Handler is vouching for the link.
   **/
  async showLink(path, context) {
    // "Vouch" for the link iff the path matches and allowAccess() is true.
    let show = false;
    if (path === this.path) {
      // Protect context.httpResponse from being overwritten.
      let originalHttpResponse = context.httpResponse;
      show = await this.allowAccess(context);
      context.httpResponse = originalHttpResponse;
    }
    return show;
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
    if (this.renderable && (this.renderable instanceof Renderable)) {
      let instance = this.renderable.newInstance(context);
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
}

/**
 * @prop {boolean} Defiant.Plugin.Router.Handler.alwaysProcess
 *   Give the request context to the handler even if another handler has already
 *   set the response body or code.
 */
Handler.alwaysProcess = false;

/**
 * @prop {boolean} Defiant.Plugin.Router.Handler.allowShowLink
 *   Permit the link to be shown even if there is not an explicit
 *   [menu]{@link Defiant.Plugin.Router.Handler.HandlerData#menu} set for it.
 */
Handler.allowShowLink = false;

/**
 * @prop {Defiant.Plugin.Theme.Renderable} Defiant.Plugin.Router.Handler.renderable
 *   The Renderable that is to be wrapped by the Theme.
 */
Handler.renderable = undefined;

module.exports = Handler;
