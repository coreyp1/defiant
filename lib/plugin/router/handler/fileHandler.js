"use strict";

const Handler = require('../../router/handler');
const File = require('../../http/response/file');

/**
 * Base class to allow pointing to a single file for download.
 *
 * The functionality of this class is in contrast to the
 * [ServeDirectoryHandler]{@link Defiant.Plugin.Router.Handler.ServeDirectoryHandler}.
 * This class will only serve a single, specific file, whereas the other will
 * serve any file in the target directory.
 *
 * This individualistic behavior allows for a more secure and controlled method
 * of delivering files, when needed.  The disadvantage is that a separate
 * handler must be created and added to the app Router for each individual file
 * that needs to be served.
 * @class
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.Router.Handler
 */
class FileHandler extends Handler {
  /**
   * @constructor
   * @param {Object} data The Handler settings.
   * @param {Defiant.Plugin.Router.Handler#id} data.id
   *   The unique id of the Handler.
   * @param {Defiant.Plugin.Router.Handler#weight} data.weight
   *   The weight of the Handler.
   * @param {Defiant.Plugin.Router.Handler#path} data.path
   *   The path that the Handler should match against.
   * @param {Defiant.Plugin.Router.Handler.FileHandler#target} data.target
   *   The local file path.
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
   * @returns {Defiant.Plugin.Router.Handler.FileHandler}
   *   The instantiated handler.
   */
  constructor(data={}) {
    super(data);
    /**
     * @member {String} Defiant.Plugin.Router.Handler.FileHandler#target
     *   The local file path.
     */
    this.target = data.target ? data.target : (this.target ? this.target : this.constructor.target);
  }

  /**
   * Determine whether or not this handler will allow access to the url in
   * [context.request]{@link Defiant.Context#request}.  May also set
   * [context.httpResponse]{@link Defiant.Context#httpResponse}.
   * @function
   * @async
   * @param {Defiant.Context} context The request context.
   **/
  async allowAccess(context) {
    let t = context.request.urlTokenized;
    return (t !== undefined) && (('/' + t.join('/')) == context.request._parsedUrl.pathname);
  }

  /**
   * Choose whether or not to "vouch" for a link.  The path provided is usually
   * about to be shown in a menu listing, so this function is a test of whether
   * or not it should actually be displayed.  It will usually piggyback
   * functionality from the allowAccess() function, but must not allow
   * httpResponse to be altered.
   * @function
   * @async
   * @param {String} path The path that we are being asked to vouch for.
   * @param {Defiant.Context} context The request context.
   * @returns {boolean} Whether or not the Handler is vouching for the link.
   **/
  async showLink(path, context) {
    // Default to always showing the link.
    return true;
  }

  /**
   * A request has been made.  Process the request and provide the necessary
   * [Renderable]{@link Defiant.Plugin.Theme.Renderable}.
   * @function
   * @async
   * @param {Defiant.Context} context The request context.
   */
  async init(context) {
    context.httpResponse = new File(context, {
      path: this.target,
    });
  }
}

FileHandler.id = 'Example.FileHandler';
FileHandler.path = 'example.file/static.txt';
FileHandler.target = __dirname + '/../file/static.txt';
// TODO: Translate
FileHandler.menu = {
  menu: 'default',
  text: 'Single File Example',
  description: 'Example of outputting a single file',
};

module.exports = FileHandler;
