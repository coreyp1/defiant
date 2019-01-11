"use strict";

const Handler = require('../../router/handler');
const File = require('../../http/response/file');

class LocalManagerHandler extends Handler {
  async init(context) {
    context.httpResponse = new File();
    context.httpResponse = 404; // File not found.
  }
}

module.exports = LocalManagerHandler;
