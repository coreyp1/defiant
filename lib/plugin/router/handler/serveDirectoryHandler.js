"use strict";

const Handler = require('./handler');
const ServeDirectory = require('../../http/response/serveDirectory');

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

  async init(context) {
    context.httpResponse = this.serveDirectory;
  }
}

module.exports = ServeDirectoryHandler;
