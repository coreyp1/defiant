"use strict";

const Response = require('./response');
const NotFoundHandler = require('../../router/handler/notFoundHandler');
const AccessDeniedHandler = require('../../router/handler/accessDeniedHandler');
const fs = require('fs');
const path = require('path');
const send = require('send');

class File extends Response {
  // TODO: Make some options pass-thru to send().
  /**
   * data = {
   *   path: '',
   *   filename: '', // Send this filename in the header.
   * }
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

    async function accessDenied() {
      let response = new AccessDeniedHandler();
      await response.init(self.context);
      return self.context.httpResponse.commit();
    }

    async function notFound() {
      let response = new NotFoundHandler();
      await response.init(self.context);
      return self.context.httpResponse.commit();
    }
  }
}

module.exports = File;
