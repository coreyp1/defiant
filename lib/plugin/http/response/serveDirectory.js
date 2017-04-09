"use strict";

const Response = require('./response');
const serveStatic = require('serve-static');
const serveIndex = require('serve-index');
const parseUrl = require('parseurl');
const merge = require('../../../util/merge');
const {coroutine: co, promisify} = require('bluebird');

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
 */

class ServeDirectory extends Response {
  constructor(context, data, handler) {
    super(context, data);

    // Set up serveStatic and indexStatic promise functions.
    this.serveStatic = promisify(serveStatic(data.target, merge({redirect: false}, data.fileOptions || {})));
    this.serveIndex = data.directoryOptions ? promisify(serveIndex(data.target, merge({icons: true, view: 'details'}, data.directoryOptions))) : undefined;
    this.handler = handler;
  }

  commit() {
    // TODO: Improve detection of invalid paths, to allow for proper
    // fall-through to later Handlers.
    return co(function*(self){
      let request = self.context.request;
      let response = self.context.response;
      let pathSkipLength = self.handler.path.split('/').length;

      // Save the original URL in case something bad happens
      let originalUrl = self.context.request.url;

      // Remove the parts of the URL before the {index} position
      request.originalUrl = request.url = '/' + request.url.split('/').filter(val => val != '').slice(pathSkipLength).join('/');
      parseUrl(request);

      // Attempt to serve the file (if it exists).
      let err = yield self.serveStatic(request, response);

      // Otherwise, serve a directory listing (if enabled).
      if (!err && self.data.directoryOptions) {
        request.__defiant_discarded = self.handler.path;
        yield self.serveIndex(request, response);
        delete request.__defiant_discarded;
      }
      else {
        // Restore the request to its original form.
        request.originalUrl = request.url = originalUrl;
        parseUrl(request);
      }
    })(this);
  }
}

/**
 * Because serveIndex() does not know about Defiant's directory structure,
 * it assumes that all the files' paths are relative to the domain.  We must
 * therefore intercept the function that prints the file listing and inject the
 * proper subdirectory path.
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
