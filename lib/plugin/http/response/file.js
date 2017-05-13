"use strict";

const Response = require('./response');
const NotFoundHandler = require('../../router/handler/notFoundHandler');
const AccessDeniedHandler = require('../../router/handler/accessDeniedHandler');
const fs = require('fs');
const path = require('path');
const send = require('send');
const {coroutine: co, promisify} = require('bluebird');

const access = promisify(fs.access);

class File extends Response {
  // TODO: Make some options pass-thru to send().
  /**
   * data = {
   *   path: '',
   *   filename: '', // Send this filename in the header.
   * }
   **/
  commit() {
    // Use promisify() in order to accommodate the data stream events.
    return promisify(function(self, done){
      return co(function*(){
        try {
          // This will throw if the system user does not have access to the file.
          yield access(self.data.path, fs.constants.R_OK);

          // Only allow access for this specific file.
          let directory = path.dirname(self.data.path);
          let filename = encodeURI(path.basename(self.data.path));

          send(self.context.request, filename, {
            index: false,
            root: directory,
          }).on('directory', co(accessDenied))
            .on('error', co(notFound))
            .on('end', done)
            .on('headers', (res, path, stat) => {
              if (self.data.filename) {
                // TODO: Escape.
                res.setHeader('Content-Disposition', `attachment; filename="${self.data.filename}"`);
              }
            })
            .pipe(self.context.response);
        }
        catch (e) {
          yield co(accessDenied)();
          return done();
        }

        function* accessDenied() {
          let response = new AccessDeniedHandler();
          yield response.init(self.context);
          return self.context.httpResponse.commit();
        }

        function* notFound() {
          let response = new NotFoundHandler();
          yield response.init(self.context);
          return self.context.httpResponse.commit();
        }
      })();
    })(this);
  }
}

module.exports = File;
