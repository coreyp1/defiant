"use strict";

const Handler = require('../../../plugin/router/handler');
const path = require('path');
const ServeDirectory = require('../../../plugin/http/response/serveDirectory');
const {coroutine: co} = require('bluebird');

class DirectoryHandler extends Handler {
  init(context) {
    return co(function*(self) {
      context.httpResponse = new ServeDirectory(context, {
        target: path.join(__dirname, '../file'),
        fileOptions: {},
        directoryOptions: {},
      },
      self.constructor);
    })(this);
  }
}

DirectoryHandler.id = 'Library.JQuery.DirectoryHandler';
DirectoryHandler.path = 'file/library/jQueryShim';

module.exports = DirectoryHandler;
