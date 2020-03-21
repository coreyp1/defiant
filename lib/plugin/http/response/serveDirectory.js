"use strict";

const serveStatic = require('serve-static');
const serveIndex = require('serve-index');
const parseUrl = require('parseurl');
const merge = require('../../../util/merge');

/**
 * See [serve-static]{@link https://github.com/expressjs/serve-static} for
 * option descriptions.
 * @typedef Defiant.Plugin.Http.Response.ServeDirectory.FileOptions
 * @prop {boolean} redirect Redirect to a trailing slash when `path` is a
 *   directory.  Defaults to `true`.
 * @prop {number|String} maxAge Max age in milliseconds for http caching.
 *   Can be a string recognized by the
 *   [ms]{@link https://www.npmjs.com/package/ms} module.  Defaults to `1d`.
 */
/**
 * See [serve-index]{@link https://www.npmjs.com/package/serve-index} for
 * option descriptions.
 * @typedef Defiant.Plugin.Http.Response.ServeDirectory.DirectoryOptions
 * @prop {boolean} icons Show icons.  Defaults to `false`
 * @prop {String} view Options are `titles` and `details`.
 */
/**
 * NOTE: serveIndex was originally created for a different use case.  It
 * expects all paths to be relative to the URL domain, while Defiant allows
 * paths to be relative to a path within that domain.
 *
 * E.g., "foo.com/subdir/subdir" may be linked to a directory, but in its
 * native mode of operation, serveIndex would be looking for "subdir/subdir"
 * within the target directory.
 *
 * We get around this limitation by monkey-patching the serveIndex module.
 * @class
 * @memberOf Defiant.Plugin.Http.Response
 */
class ServeDirectory {
  /**
   * @constructor
   * @param {Object} data
   *   The configurations for how this directory should be served.
   * @param {String} data.path
   *   The request path to respond to.
   * @param {String} data.target
   *   The real path on the file system.
   * @param {Defiant.Plugin.Http.Response.ServeDirectory.FileOptions} data.fileOptions
   * @param {Defiant.Plugin.Http.Response.ServeDirectory.DirectoryOptions} data.directoryOptions
   *   If `undefined`, then directory listings will not be given.
   */
  constructor(data) {
    // Set up serveStatic and indexStatic promise functions.
    this.serveStatic = serveStatic(data.target, merge({redirect: false, maxAge: '1d'}, data.fileOptions || {}));
    this.serveIndex = data.directoryOptions ? serveIndex(data.target, merge({icons: true, view: 'details'}, data.directoryOptions)) : undefined;
    this.path = data.path;
    this.target = data.target;
    this.data = data;
  }

  /**
   * Service the request.
   * @function
   * @async
   * @param {Defiant.Context} The request context.
   */
  async commit(context) {
    // TODO: Improve detection of invalid paths, to allow for proper
    // fall-through to later Handlers.
    let request = context.request;
    let response = context.response;
    let pathSkipLength = this.path.split('/').length;

    // Save the original URL in case something bad happens
    let originalUrl = context.request.url;

    // Remove the parts of the URL before the {index} position
    request.originalUrl = request.url = '/' + request.url.split('/').filter(val => val != '').slice(pathSkipLength).join('/');
    parseUrl(request);

    // Attempt to serve the file (if it exists).
    let err = await new Promise((accept) => {
        this.serveStatic(request, response, accept);
    });

    // Otherwise, serve a directory listing (if enabled).
    if (!err && this.data.directoryOptions) {
      request.__defiant_discarded = this.path;
      await new Promise((accept) => {
        this.serveIndex(request, response, accept);
      });
      delete request.__defiant_discarded;
    }
    else {
      // Restore the request to its original form.
      request.originalUrl = request.url = originalUrl;
      parseUrl(request);
    }
  }
}

/**
 * Because serveIndex() does not know about Defiant's directory structure,
 * it assumes that all the files' paths are relative to the domain.  We must
 * therefore intercept the function that prints the file listing and inject the
 * proper subdirectory path.
 * @ignore
 */
const originalServeIndexHtml = serveIndex.html;
serveIndex.html = function() {
  if (arguments[0].__defiant_discarded) {
    if (arguments[4] == '/') {
      arguments[2].unshift('..');
    }
    arguments[4] = arguments[0].__defiant_discarded + arguments[4];
  }
  originalServeIndexHtml.apply(this, arguments);
};

module.exports = ServeDirectory;
