"use strict";

const Handler = require('../../router/handler');
const path = require('path');
const ServeDirectory = require('../../http/response/serveDirectory');
const {coroutine: co} = require('bluebird');

class JQueryHandler extends Handler {
  init(context) {
    return co(function*(self) {
      context.httpResponse = new ServeDirectory(context, {
        target: path.dirname(require.resolve('jquery')),
        fileOptions: {},
        directoryOptions: undefined,
      },
      self.constructor);
    })(this);
  }
}

JQueryHandler.id = 'ThemeBase.JQueryHandler';
JQueryHandler.path = 'file/theme/themeBase/jQuery';

module.exports = JQueryHandler;
