"use strict";

const Handler = require('../../../plugin/router/handler');
const path = require('path');
const ServeDirectory = require('../../../plugin/http/response/serveDirectory');
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

JQueryHandler.id = 'Library.JQuery.JQueryHandler';
JQueryHandler.path = 'file/library/jQuery';

module.exports = JQueryHandler;
