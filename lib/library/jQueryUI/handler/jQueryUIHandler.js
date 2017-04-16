"use strict";

const Handler = require('../../../plugin/router/handler');
const path = require('path');
const ServeDirectory = require('../../../plugin/http/response/serveDirectory');
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

JQueryUIHandler.id = 'Library.JQueryUI.JQueryUIHandler';
JQueryUIHandler.path = 'file/library/jQueryUI';

module.exports = JQueryUIHandler;
