"use strict";

const Handler = require('../../router/handler');
const path = require('path');
const ServeDirectory = require('../../http/response/serveDirectory');
const {coroutine: co} = require('bluebird');

class DirectoryHandler extends Handler {
  init(context) {
    return co(function*() {
      context.httpResponse = new ServeDirectory(context, {
        target: path.join(__dirname, '../file'),
        fileOptions: {},
        directoryOptions: undefined,
      });
    })();
  }
}

DirectoryHandler.id = 'Layout.DirectoryHandler';
DirectoryHandler.path = 'file/layout';

module.exports = DirectoryHandler;
