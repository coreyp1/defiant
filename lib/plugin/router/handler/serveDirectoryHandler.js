"use strict";

const Handler = require('./handler');
const ServeDirectory = require('../../http/response/serveDirectory');
const {coroutine: co} = require('bluebird');

class ServeDirectoryHandler extends Handler {
  /**
   * data = {
   *   id, // The unique ID of this Handler
   *   path, // The path to listen on
   *   target, // The target directory
   *   menu, // Menu options
   *   fileOptions: {
   *     redirect,
   *     maxAge,
   *   },
   *   directoryOptions: { // If undefined, no directory listing will be given
   *     icons,
   *     view,
   *   }
   */
  constructor(data) {
    super(data);
    this.serveDirectory = new ServeDirectory(data);
  }

  init(context) {
    return co(function*(self) {
      context.httpResponse = self.serveDirectory;
    })(this);
  }
}

module.exports = ServeDirectoryHandler;
