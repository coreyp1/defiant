"use strict";

const Handler = require('../../router/handler');
const path = require('path');
const ServeDirectory = require('../../http/response/serveDirectory');
const {coroutine: co} = require('bluebird');

class BootstrapDirectoryHandler extends Handler {
  init(context) {
    return co(function*(self) {
      context.httpResponse = new ServeDirectory(context, {
        target: path.join(path.dirname(require.resolve('bootstrap')), '..'),
        fileOptions: {},
        directoryOptions: undefined,
      },
      self.constructor);
    })(this);
  }
}

BootstrapDirectoryHandler.id = 'ThemeBase.BootstrapDirectoryHandler';
BootstrapDirectoryHandler.path = 'file/theme/bootstrap';

module.exports = BootstrapDirectoryHandler;
