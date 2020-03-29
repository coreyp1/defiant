"use strict";

const Handler = require('../../router/handler');
const File = require('../../http/response/file');

/**
 * Serve a single file from the local file manager.
 * @todo  FIX THIS.  IT'S BROKEN!!!
 * @class
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.FileApi
 */
class LocalManagerHandler extends Handler {
  /**
   * A request has been made.  Process the request and provide the necessary
   * [Renderable]{@link Defiant.Plugin.Theme.Renderable}.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
    context.httpResponse = new File();
    context.httpResponse = 404; // File not found.
  }
}

module.exports = LocalManagerHandler;
