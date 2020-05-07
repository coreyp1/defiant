'use strict';

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const http = require('http');
const Connect = require('connect');

/**
 * The Http plugin accepts incoming HTTP requests and fulfills them using the
 * app Router.
 * @todo Remove dependency on Connect.
 * @todo Do we need to use the incomingRegistry?  Currently it is just a pass
 *   through to the Router plugin.
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Plugin
 */
class Http extends Plugin {
  /**
   * @constructor
   * @param {Defiant.Engine} engine The app engine.
   * @returns {Defiant.Plugin.Http} The instantiated Http plugin.
   */
  constructor(engine) {
    super(engine);

  }

  /**
   * Process a notification that some `plugin` has performed some `action`.
   * @todo Make the port configurable in a setting.
   * @todo Give a better log message.
   * @todo Extend to Https.
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
        // Create a registry for incoming Http connections.
        /**
         * @member {Defiant.util.Registry} Defiant.Plugin.Http#incomingRegistry
         *   A registry of callback functions to handle an incoming Http request.
         */
        this.incomingRegistry = new Registry();

        // Add this as an instance of Connect middleware.
        /**
         * @member {Object} Defiant.Plugin.Http#connect A reference to the Connect
         *   middleware.
         */
        this.connect = Connect();
        this.connect.use((...args) => this.incoming(...args));

        /**
         * @member {Object} Defiant.Plugin.Http#http A reference to the http server.
         */
        this.http = http.createServer(this.connect);
        this.http.listen(8888, () => console.log('Server has started'));
        break; // 'pre-enable'

      case 'pre:disable':
        // @todo Stop http listening.
        break; // pre:disable
    }
  }

  /**
   * Handle incoming messages.
   * @function
   * @async
   * @param {Object} request The request object.
   * @param {Object} response The response object.
   * @param {function} next The callback that should be called after all
   *   handlers have been run.
   */
  async incoming(request, response, next) {
    let elements = this.incomingRegistry.getOrderedElements();
    /**
     * Context is not a class, but a container that Defiant uses to transport all
     * information pertaining to an incoming request.  Other plugins may add to
     * the `context` object as needed.
     * @class Context
     * @memberOf Defiant
     */
    let context = {
      /**
       * @member {Object} Defiant.Context#request
       *   The request object.
       */
      request,
      /**
       * @member {Object} Defiant.Context#response
       *   The response object.
       */
      response,
      /**
       * @member {Defiant.Engine} Defiant.Context#engine
       *   The app engine.
       */
      engine: this.engine,
      /**
       * @member {Defiant.Plugin.Http.Response} Defiant.Context#httpResponse
       *   The response to be sent to the requester.
       */
      httpResponse: undefined,
    };
    for (let element of elements) {
      if (context.httpResponse != undefined) {
        break;
      }
      await element.incoming(context);
    }
    if (context.httpResponse !== undefined) {
      let wait = context.httpResponse.commit(context);
      if ((typeof wait === 'object') && (wait.constructor.name === 'Promise')) {
        await wait;
      }
    }
    else {
      next();
    }
  }
}

module.exports = Http;
