"use strict";

const Handler = require('../../router/handler');
const File = require('../../http/response/file');

class LocalManagerHandler extends Handler {
  init(context) {
    context.httpResponse = new File();
    context.httpResponse = 404; // File not found.
    return Promise.resolve(true);
  }
}

module.exports = LocalManagerHandler;
