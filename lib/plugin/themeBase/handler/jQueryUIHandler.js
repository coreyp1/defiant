"use strict";

const Handler = require('../../router/handler');
const path = require('path');
const ServeDirectory = require('../../http/response/serveDirectory');
const {coroutine: co} = require('bluebird');

class JQueryUIHandler extends Handler {
  init(context) {
    return co(function*(self) {
      context.httpResponse = new ServeDirectory(context, {
        target: path.dirname(require.resolve('jquery-ui-bundle')),
        fileOptions: {},
        directoryOptions: undefined,
      },
      self.constructor);
    })(this);
  }
}

JQueryUIHandler.id = 'ThemeBase.JQueryUIHandler';
JQueryUIHandler.path = 'file/theme/themeBase/jQueryUI';

module.exports = JQueryUIHandler;
