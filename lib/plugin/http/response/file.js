"use strict";

const Response = require('./response');
const NotFoundHandler = require('../../router/handler/notFoundHandler');
const AccessDeniedHandler = require('../../router/handler/accessDeniedHandler');
const fs = require('fs');
const path = require('path');
const send = require('send');

/**
 * Class for sending a file as a response to a HTTP request.
 * @class
 * @extends Defiant.Plugin.Http.Response
 * @memberOf Defiant.Plugin.Http
 */
class File extends Response {
  /**
   * @constructor
   * @param {Defiant.Context} context The request context.
   * @param {Object} data The data to initialize the request.
   * @param {String} data.path The local file path being requested.
   * @param {String} data.filename Send this filename in the header.
   */
  constructor(context, data) {
    super(context, data);
  }
  /**
   * Either send the file or respond with a 403 or 404.
   * @todo Make some options pass-thru to send().
   * @function
   * @async
   **/
  async commit() {
    let self = this;
    // Use a promise in order to accommodate the data stream events.
    try {
      // This will throw if the system user does not have access to the file.
      await fs.promises.access(this.data.path, fs.constants.R_OK);

      // Only allow access for this specific file.
      let directory = path.dirname(this.data.path);
      let filename = encodeURI(path.basename(this.data.path));

      send(this.context.request, filename, {
        index: false,
        root: directory,
      }).on('directory', accessDenied)
        .on('error', notFound)
        .on('headers', (res, path, stat) => {
          if (this.data.filename) {
            // TODO: Escape.
            res.setHeader('Content-Disposition', `attachment; filename="${this.data.filename}"`);
          }
        })
        .pipe(this.context.response);
    }
    catch (e) {
      await accessDenied();
      return;
    }

    /**
     * Provide a 403 Access Denied.
     * @function
     * @async
     */
    async function accessDenied() {
      let response = new AccessDeniedHandler();
      await response.init(self.context);
      return self.context.httpResponse.commit();
    }

    /**
     * Provide a 404 Not Found.
     * @function
     * @async
     */
    async function notFound() {
      let response = new NotFoundHandler();
      await response.init(self.context);
      return self.context.httpResponse.commit();
    }
  }
}

module.exports = File;
