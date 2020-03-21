"use strict";

const Handler = require('./handler');
const ServeDirectory = require('../../http/response/serveDirectory');

/**
 * This handler is a general-purpose handler to serve all files in a particular
 * directory and all of its subdirectories.  It can even serve files from
 * directories outside of the Defiant path, which is needed for external files.
 * @class
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.Router.Handler
 */
class ServeDirectoryHandler extends Handler {
  /**
   * @constructor
   * @param {Object} data
   *   The handler settings.
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
   * @param {String} data.target
   *   The target directory
   * @param {Defiant.Plugin.Http.Response.ServeDirectory.FileOptions} data.fileOptions
   *   The options for serving files.
   * @param {Defiant.Plugin.Http.Response.ServeDirectory.DirectoryOptions} data.directoryOptions
   *   The options for serving directories.
   * @returns {Defiant.Plugin.Router.Handler.ServeDirectoryHandler}
   *   The constructed handler.
   */
  constructor(data) {
    super(data);
    /**
     * @member {Defiant.Plugin.Http.Response.ServeDirectory}
     *   Defiant.Plugin.Router.Handler.ServeDirectoryHandler#serveDirectory
     *   The HTTP response that will perform the directory serving.
     */
    this.serveDirectory = new ServeDirectory(data);
  }

  /**
   * A request has been made.  Process the request and provide the necessary
   * [Renderable]{@link Defiant.Plugin.Theme.Renderable}.
   * @function
   * @async
   * @param {Defiant.Context} context The request context.
   */
  async init(context) {
    context.httpResponse = this.serveDirectory;
  }
}

module.exports = ServeDirectoryHandler;
