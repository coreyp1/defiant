"use strict";

const Handler = require('../../router/handler');
const path = require('path');
const ServeDirectory = require('../../http/response/serveDirectory');
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

DirectoryHandler.id = 'Example.DirectoryHandler';
DirectoryHandler.path = 'example.directory';
// TODO: Translate
DirectoryHandler.menu = {
  menu: 'default',
  text: 'Directory Example',
  description: 'Example of serving a directory',
};

module.exports = DirectoryHandler;
