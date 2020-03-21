'use strict';

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const http = require('http');
const Connect = require('connect');

/**
 * The Http plugin accepts incoming http requests and fulfills them using the
 * app Router.
 * @todo Remove dependency on Connect.
 * @todo Do we need to use the incomingRegistry?  Currently it is just a pass
 *   through to the Router plugin.
 * @class
 * @extends Defiant.Plugin
 */
class Http extends Plugin {
  /**
   * @constructor
   * @param {Defiant.Engine} engine The app engine.
   * @returns {Defiant.Plugin.Http} The instantiated Http plugin.
   */
  constructor(engine) {
    super(engine);

    /**
     * @member {Defiant.util.Registry} Defiant.Plugin.Http#incomingRegistry
     *   A registry of callback functions to handle an incoming Http request.
     */
    // Create a registry for incoming Http connections.
    this.incomingRegistry = new Registry();

    /**
     * @member {Object} Defiant.Plugin.Http#connect A reference to the Connect
     *   middleware.
     */
    // Add this as an instance of Connect middleware.
    this.connect = Connect();
    this.connect.use((...args) => this.incoming(...args));

    /**
     * @member {Object} Defiant.Plugin.Http#http A reference to the http server.
     */
    this.http = http.createServer(this.connect);
  }

  /**
   * Initialize the server and start listening.
   * @todo Make the port configurable in a setting.
   * @todo Give a better log message.
   * @todo Extend to Https.
   * @function
   * @async
   */
  async init() {
    this.http.listen(8888, () => console.log('Server has started'))
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
    let elements = this.incomingRegistry.getOrderedElements(),
        context = {request, response, engine: this.engine, httpResponse: undefined};
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
